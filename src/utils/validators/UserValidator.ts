import { IUser } from '../../interfaces/IUser';
import joi from 'joi';

export const UserPostValidator = joi.object<IUser>({
    username:
        joi.string()
            .max(50)
            .required()
            .messages({
                "string.max": "Maximo 50 caracteres.",
                "any.required": "El nombre es requerido."
            }),
    email:
        joi.string()
            .email({ minDomainSegments: 2 })
            .required()
            .messages({
                "string.email": "Correo no valido.",
                "any.required": "El correo es requerido."
            }),
    password:
        joi.string()
            .pattern(new RegExp(/^(?=.*\d)(?=.*[a-zA-Z])(?=.*[A-Z])(?=.*[-\#\$\.\%\&\*\@])(?=.*[a-zA-Z]).{8,16}$/))
            .required()
            .messages({
                "string.pattern.base": "La contraseña no es segura.",
                "any.required": "La contraseña es requerida."
            }),
});

export const UserPutValidator = joi.object<IUser>({
    username: joi.string()
        .max(50)
        .messages({
            "string.max": "Nombre maximo 50 caracteres."
        }),
    email: joi.string()
        .email({ minDomainSegments: 2 })
        .messages({
            "string.email": "Correo no valido."
        }),
    password: joi.string()
        .required()
        .messages({
            "any.required": "La contraseña es requerida."
        })
});