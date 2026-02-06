import {z} from 'zod';

import {
  ContactDetailsSchema,
  CurrentPermissionsSchema,
  CurrentUserSchema,
  DonorTeacherBannerDetailsSchema,
  HasDismissedPersonalizationAlertSchema,
  NetsimSignedInSchema,
  PostponeCensusBannerSchema,
  SchoolNameSchema,
} from './users.schemata';

export type CurrentUser = z.infer<typeof CurrentUserSchema>;
export type NetsimSignedIn = z.infer<typeof NetsimSignedInSchema>;
export type SchoolName = z.infer<typeof SchoolNameSchema>;
export type ContactDetails = z.infer<typeof ContactDetailsSchema>;
export type DonorTeacherBannerDetails = z.infer<
  typeof DonorTeacherBannerDetailsSchema
>;
export type CurrentPermissions = z.infer<typeof CurrentPermissionsSchema>;
export type PostponeCensusBanner = z.infer<typeof PostponeCensusBannerSchema>;
export type HasDismissedPersonalizationAlert = z.infer<
  typeof HasDismissedPersonalizationAlertSchema
>;
