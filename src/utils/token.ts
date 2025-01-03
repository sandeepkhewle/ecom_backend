import jwt, { JwtPayload } from 'jsonwebtoken';
import companyUser from '@/resources/companyUser/interface';
import salesUser from '@/resources/salesUser/interface';
import salesUserModel from '@/resources/salesUser/model'
import companyUserModel from '@/resources/companyUser/model'
import Token from '@/utils/interface/token.interface';
import moment from 'moment';
import { response, request } from 'express';

export const createToken = (
  user: companyUser | salesUser | any,
  expiresIn?: string
): any => {
  console.log("user", user.editAccess);

  const userInfo = {
    id: user._id,
    name: user.name || user.fullName,
    emailId: user.emailId,
    role: user.role,
    roleId: user.roleId,
    company_id: user.company_id,
    reportingToRole: user.reportingToRoles,
    access: user.access,
    editAccess: user.editAccess,
  };

  const token = jwt.sign(userInfo, process.env.JWT_SECRET as jwt.Secret, {
    expiresIn: expiresIn,
  });

  return token;
};

export const verifyToken = async (token: string, pageId: string): Promise<jwt.VerifyErrors | any> => {

    let id = pageId;

    return new Promise((resolve, reject) => {
        jwt.verify(
            token,
            process.env.JWT_SECRET as jwt.Secret,
            (err, payload) => {
                if (err) return reject(err);
                resolve(payload)
                // if (id === 'eHqRW2c9') {
                //     companyUserModel.findOne({ emailId: payload.emailId }).select(['fullname', 'emailId', 'role', 'companyId', 'reportingToRoles'])
                //         .then((userInfo: any) => resolve(userInfo))
                // } else {
                //     salesUserModel.findOne({ emailId: payload.emailId }).select(['fullname', 'emailId', 'role', 'companyId', 'reportingToRoles'])
                //         .then((userInfo: any) => resolve(userInfo))
                // }

                ;
            }
        );
    });
};

export default { createToken, verifyToken };
