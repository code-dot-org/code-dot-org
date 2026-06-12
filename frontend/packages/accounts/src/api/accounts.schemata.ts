import {z} from 'zod';

// Wire (snake_case) shape of GET /api/v1/account/settings, transformed to the
// camelCase model the page consumes. Mirrors core's schemata→types→api
// structure (D12). Not exported from the package root.

const AuthenticationOptionSchema = z.object({
  credential_type: z.string(),
  email: z.string().nullable(),
});

export const AccountSettingsResponseSchema = z
  .object({
    user_type: z.enum(['student', 'teacher']),
    given_name: z.string().nullable(),
    family_name: z.string().nullable(),
    display_name: z.string(),
    username: z.string().nullable(),
    email: z.string().nullable(),
    has_password: z.boolean(),
    can_edit_email: z.boolean(),
    can_edit_password: z.boolean(),
    should_see_edit_email_link: z.boolean(),
    authentication_options: z.array(AuthenticationOptionSchema),
    can_change_user_type: z.boolean(),
    can_delete_own_account: z.boolean(),
    age: z.union([z.number(), z.string()]).nullable(),
    us_state: z.string().nullable(),
    dependent_students_count: z.number(),
  })
  .transform(r => ({
    userType: r.user_type,
    givenName: r.given_name,
    familyName: r.family_name,
    displayName: r.display_name,
    username: r.username,
    email: r.email,
    hasPassword: r.has_password,
    canEditEmail: r.can_edit_email,
    canEditPassword: r.can_edit_password,
    shouldSeeEditEmailLink: r.should_see_edit_email_link,
    authenticationOptions: r.authentication_options.map(option => ({
      credentialType: option.credential_type,
      email: option.email,
    })),
    canChangeUserType: r.can_change_user_type,
    canDeleteOwnAccount: r.can_delete_own_account,
    age: r.age,
    usState: r.us_state,
    dependentStudentsCount: r.dependent_students_count,
  }));
