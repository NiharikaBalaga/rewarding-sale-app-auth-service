import { body, matchedData, validationResult } from 'express-validator';
import type { NextFunction, Request, Response } from 'express';
import { httpCodes } from '../constants/http-status-code';

const validPhoneNumber = () => {
  return  [
    body('phoneNumber')
      .trim()
      .notEmpty()
      .escape()
      .matches(/^\d{3}-\d{3}-\d{4}$/)
      .withMessage('Phone number must be in the format xxx-xxx-xxxx')];
};
const verifyOtp = () => {
  const validPhoneNumberResult = validPhoneNumber();

  return [
    ...validPhoneNumberResult,
    body('otp')
      .trim()
      .notEmpty()
      .escape()
      .isNumeric()
      .isLength({ min: 6, max: 6 })
      .withMessage('Must be a Valid OTP')];
};


const validateErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    const data = matchedData(req);
    req.body['matchedData'] = data;
    return next();
  }
  const extractedErrors: any = [];
  errors.array().map((err: any) => extractedErrors.push({ [err.param || err.path]: err.msg }));
  return res.status(httpCodes.unprocessable_entity).json({
    errors: extractedErrors
  });
};

export { validPhoneNumber, validateErrors, verifyOtp };