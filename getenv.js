import {config} from "dotenv"

config();

const PREFIX = "VISMA";

const getEnv = (name) => {
    const env = process.env;
    return env[`${PREFIX}_${name}`];
};

export default getEnv;