import { cleanEnv, str, port } from 'envalid';

function vaildateEnv(): void {
    cleanEnv(process.env, {
        NODE_ENV: str({
            choices: ['development', 'production']
        }),
        MONGO_PATH: str(),
        PORT: str({ default: '3008' }),
        SECUREPORT: str({ default: '3009' }),
    });
}

export default vaildateEnv;