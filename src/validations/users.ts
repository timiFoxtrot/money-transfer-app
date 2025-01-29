import { celebrate, Joi, Segments } from "celebrate";

export const createUserSchema = celebrate(
  {
    [Segments.BODY]: Joi.object().keys({
      first_name: Joi.string().trim().required(),
      last_name: Joi.string().trim().required(),
      email: Joi.string().trim().email().required(),
      phone_number: Joi.string().trim().required(),
      password: Joi.string()
        .trim()
        .min(8)
        .pattern(
          new RegExp(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&#_]+$"
          )
        )
        .required()
        .messages({
          "string.min": "Password must be at least 8 characters long",
          "string.pattern.base":
            "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character",
        }),
    }),
  },
  {
    abortEarly: false, // Return all validation errors at once
  }
);
