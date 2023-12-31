import { UserModel } from '../models/UserModel';
import { v4 as uuid } from 'uuid';
import { ServiceError } from '../utils/errors/service.error';
import { HttpStatusCode } from '../router/RouterTypes';
import bc from "bcrypt";
import jwt from "jsonwebtoken";
import { Conection } from '../database/Conection';
import { IUser } from '../interfaces/IUser';

export class UserService {

    constructor(
        private readonly conection: Conection
    ) { }

    getAll = (): Promise<IUser[]> => {
        return new Promise(async (res, rej) => {
            const client = await this.conection.connect();
            const userModel = new UserModel(client);
            try {
                const users = await userModel.getAll();
                await this.conection.commit(client);
                res(users);
            } catch (err) {
                await this.conection.rollback(client);
                rej(err);
            }
        });
    };

    getById = (id: string): Promise<IUser | null> => {
        return new Promise(async (res, rej) => {
            const client = await this.conection.connect();
            const userModel = new UserModel(client);
            try {
                const user = await userModel.getById(id);
                await this.conection.commit(client);
                res(user);
            } catch (err) {
                await this.conection.rollback(client);
                rej(err);
            }
        });
    };

    insert = (entity: IUser): Promise<string> => {
        return new Promise(async (res, rej) => {
            const client = await this.conection.connect();
            const userModel = new UserModel(client);
            try {
                const _userCheck = await userModel.getByEmail(entity.email);
                if (_userCheck) throw new ServiceError("El correo ya se encuentra en uso.");

                entity.password = await bc.hash(entity.password, 10);

                const id = uuid();
                const IUser: IUser = {
                    ...entity, id
                }
                const _user = await userModel.insert(IUser);
                if (!_user) throw new ServiceError("Error al crear el usuario.", HttpStatusCode.BAD_REQUEST);

                const token = jwt.sign({
                    user_id: _user.id,
                }, process.env.JWT_SECRET!, {
                    expiresIn: "24h"
                });
                await this.conection.commit(client);
                res(token);
            } catch (error) {
                await this.conection.rollback(client);
                rej(error)
            }
        });
    }
    
    update = (id: string, entity: Partial<IUser>) => {
        return new Promise(async (res, rej) => {
            const client = await this.conection.connect();
            const userModel = new UserModel(client);
            try {
                const userCheck = await userModel.getById(id);

                if (!userCheck)
                    throw new ServiceError("Usuario no encontrado.", HttpStatusCode.NOT_FOUND);

                const { password, ...rest } = entity;

                const math = await bc.compare(password!, userCheck.password);

                if (!math)
                    throw new ServiceError("Contraseña incorrecta.", HttpStatusCode.UNAUTHORIZED);

                const IUser = await userModel.update(id, rest);

                if (!IUser)
                    throw new ServiceError("No se pudo actualizar el usuario.", HttpStatusCode.INTERNAL_SERVER_ERROR);

                await this.conection.commit(client);
                res(IUser);
            } catch (error) {
                await this.conection.rollback(client);
                rej(error)
            }
        });
    };

}