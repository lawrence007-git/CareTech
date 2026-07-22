import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import type { DataModel } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

// Previously `Google` was passed straight into providers[] unconfigured,
// relying entirely on @auth/core's default profile mapping. That default
// SHOULD map sub/name/email/picture -> id/name/email/image, but there was
// no normalization and no way to see what Google actually sent, which is
// what made this so hard to pin down. This makes the mapping explicit,
// normalizes the email the exact same way CareTechPassword does (so the
// two providers can never disagree on casing/whitespace again), and
// guarantees `image` is always read from the right field.
const CareTechGoogle = Google({
  profile(googleProfile) {
    return {
      id: googleProfile.sub,
      name: googleProfile.name,
      email:
        typeof googleProfile.email === "string"
          ? googleProfile.email.toLowerCase().trim()
          : undefined,
      image: googleProfile.picture,
    };
  },
});

// Custom Password provider: pulls the extra sign-up fields (first/last name)
// out of the params sent from SignUpForm and writes them onto the users
// document. `profile` is called for every flow (signUp, signIn, etc.) so we
// only require the extra fields to be present — email/password are always
// there.
const CareTechPassword = Password<DataModel>({
  profile(params) {
    // Normalize email HERE, at the source, not just later in
    // createOrUpdateUser. This is what actually fixes the Google/Password
    // "two different accounts for the same email" bug: if the email isn't
    // normalized the same way every time it's written or looked up,
    // "Jane@x.com" and "jane@x.com" are treated as different people.
    const email = (params.email as string).toLowerCase().trim();

    return {
      email,
      name: `${params.firstName ?? ""} ${params.lastName ?? ""}`.trim() || undefined,
      firstName: params.firstName as string | undefined,
      lastName: params.lastName as string | undefined,
      // SECURITY: role is intentionally NOT read from `params` here.
      // Previously this was `(params.role as Role) ?? "customer"` — but
      // `params` is whatever the CLIENT sends to signIn(), and nothing on
      // the server stopped someone from calling
      //   signIn("password", { flow: "signUp", email, password, role: "admin" })
      // directly (e.g. from the browser console) to self-promote to admin.
      // Removing the role picker from the sign-up FORM never closed that
      // hole — only the server refusing to read it does. Every self-service
      // sign-up is hard-coded to "customer" now. Admin/manager/staff
      // accounts must be granted separately (dashboard for now; an
      // admin-only invite mutation is a natural next step).
      role: "customer" as const,
    };
  },
  validatePasswordRequirements: (password: string) => {
    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      throw new ConvexError("Password must be at least 8 characters and include a letter and a number.");
    }
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [CareTechPassword, CareTechGoogle],
  callbacks: {
    // Controls account linking: makes sure one person only ever ends up with
    // ONE users row, no matter which method they sign in with.
    //
    //  - Google sign-in: Google itself verifies the email address, so it's
    //    safe to match it against an existing user and link to that account
    //    (e.g. someone who first signed up with a password, then later
    //    clicks "Sign in with Google" with the same email).
    //  - Password sign-up: we do NOT auto-link this to an existing account
    //    just because the email matches. Anyone can type in an email they
    //    don't own — auto-linking here would let an attacker attach a
    //    password *they* chose to *your* existing account. Instead we
    //    reject the sign-up and point them at signing in / using Google.
    async createOrUpdateUser(ctx: MutationCtx, args) {
      // DIAGNOSTIC LOGGING: this function was silently producing empty/
      // missing users for Google sign-ins with no visible error anywhere.
      // Logging every call here means the Convex Logs tab will show
      // something on EVERY attempt from now on — even a successful one —
      // so it's finally possible to see what Google actually sent, instead
      // of guessing. Safe to leave in; it doesn't log secrets, only the
      // shape of what arrived. Remove once Google sign-in is confirmed
      // working end-to-end.
      console.log("[auth] createOrUpdateUser called", {
        type: args.type,
        existingUserId: args.existingUserId ?? null,
        profileKeys: Object.keys(args.profile ?? {}),
        email: (args.profile as { email?: string } | undefined)?.email ?? null,
      });

      // Already resolved to a known user (e.g. an ordinary repeat sign-in
      // with correct password, or an already-linked Google account).
      //
      // IMPORTANT: don't trust this blindly. Convex Auth sets
      // existingUserId based on its own internal authAccounts linking
      // table — but if that user document was ever deleted (e.g. during
      // manual cleanup of duplicate test accounts), this ID can point at
      // NOTHING. Returning a dangling ID silently breaks the session: the
      // person appears "signed in" but every query that does
      // ctx.db.get(userId) returns null, which is exactly what a totally
      // blank profile (no name, no email, no image) looks like from the
      // outside. Verify the document is actually still there before
      // trusting the shortcut.
      if (args.existingUserId) {
        const existingDoc = await ctx.db.get(args.existingUserId);
        if (existingDoc) {
          // SUSPENSION CHECK: every ordinary repeat sign-in (and every
          // already-linked Google sign-in) passes through this exact
          // branch, which makes it the one correct chokepoint to actually
          // block a disabled account, rather than just hiding the row in
          // the admin UI. `disabled` is admin-set via users.setDisabled —
          // see convex/users.ts.
          //
          // UNVERIFIED ASSUMPTION, TEST BEFORE TRUSTING: this relies on
          // @convex-dev/auth treating a throw from createOrUpdateUser as
          // fatal to the whole sign-in mutation (no session issued), since
          // this callback runs inside the same mutation that would
          // otherwise create one. If that assumption is wrong and the
          // library swallows this error instead, a disabled account could
          // still end up signed in. Confirm by disabling a test account
          // and attempting to sign in with it end-to-end before relying on
          // this in production.
          if (existingDoc.disabled) {
            throw new ConvexError("This account has been disabled. Contact an admin for access.");
          }

          // Last-active stamping lives here rather than in a query,
          // because queries can't write, and this is the only mutation
          // guaranteed to run on every successful sign-in — first-time
          // link or the thousandth ordinary one.
          await ctx.db.patch(existingDoc._id, { lastActiveAt: Date.now() });

          return args.existingUserId;
        }
        console.log(
          "[auth] existingUserId was stale (no such user document) — falling through to email lookup/creation",
          { staleUserId: args.existingUserId },
        );
        // Fall through to the normal email-based lookup/creation logic
        // below, instead of returning an ID that points at nothing.
      }

      // Google's email isn't guaranteed to already be lowercase/trimmed
      // either, so normalize it the same way here as in profile() above —
      // both paths into this table need to agree on one canonical form or
      // the lookup below silently fails to find a real match.
      const email = (args.profile.email as string | undefined)?.toLowerCase().trim();

      const existing = email
        ? await ctx.db
            .query("users")
            .withIndex("email", (q) => q.eq("email", email))
            .unique()
        : null;

      const isVerifiedEmailProvider = args.type === "oauth"; // Google, currently our only OAuth provider

      if (existing) {
        if (isVerifiedEmailProvider) {
          // Same suspension guard as the existingUserId branch above — this
          // is the FIRST time this person links Google to an existing
          // account, so it hasn't gone through that check yet on this call.
          if (existing.disabled) {
            throw new ConvexError("This account has been disabled. Contact an admin for access.");
          }

          // Linking to an existing account (e.g. this person originally
          // signed up with Password, and is now signing in with Google for
          // the first time). Google sends a name and profile picture on
          // every sign-in — backfill any of those fields that are still
          // empty on the existing record, without overwriting anything the
          // person already has set (e.g. don't clobber a custom name they
          // set some other way with whatever Google happens to call them).
          const patch: Record<string, unknown> = {
            // Unlike name/image, lastActiveAt has no "don't clobber"
            // condition — it should always move forward to now.
            lastActiveAt: Date.now(),
          };
          const googleName = args.profile.name as string | undefined;
          const googleImage = args.profile.image as string | undefined;
          if (googleName && !existing.name) patch.name = googleName;
          if (googleImage && !existing.image) patch.image = googleImage;
          await ctx.db.patch(existing._id, patch);
          return existing._id;
        }
        throw new ConvexError(
          "An account with this email already exists. Try signing in instead, " +
            "or use \u201cSign in with Google\u201d if that's how you originally signed up."
        );
      }

      // Brand new person — create their user record. `role` only ever comes
      // from the Password provider's profile() above (hard-coded to
      // "customer"); Google sign-ups have no role field on `args.profile`
      // at all, so this also defaults to "customer" for them.
      return await ctx.db.insert("users", {
        email,
        name: args.profile.name as string | undefined,
        image: args.profile.image as string | undefined,
        firstName: (args.profile as { firstName?: string }).firstName,
        lastName: (args.profile as { lastName?: string }).lastName,
        role: "customer",
        // Stamp on creation too, so lastActiveAt is never a confusing gap
        // for brand-new accounts — it means "last signed in", and signing
        // up is a sign-in.
        lastActiveAt: Date.now(),
      });
    },
  },
});