import express, { Application } from 'express'
import mongoose from 'mongoose';
import compression from 'compression'
import helmet from 'helmet';
import cors from "cors";
import morgan from 'morgan'
import Controller from '@/utils/interface/controller.interface'
import ErrorMiddleware from '@/middleware/error.middleware'
import swaggerUi from "swagger-ui-express";
import swaggerDocument from './swagger.json';
import test from './test/index';
import bodyParser from 'body-parser';
import fs from 'fs';
import https from 'https';
import ejs from 'ejs';

class App {
    public express: Application;
    public port: number;
    public securePort: number;
    public url: string | any = process.env.URL;

    constructor(controllers: Controller[], port: number, securePort: number) {
        this.express = express()
        this.port = port;
        this.securePort = securePort;

        this.initMiddleware();
        this.initErrorHanding();
        this.initDatabase();
        this.initControllers(controllers);
        this.initSwagger();
    }

    private initMiddleware(): void {
        this.express.use(bodyParser.json());

        this.express.use(bodyParser.urlencoded({ extended: true }));
        // this.express.use(express.json({ limit: '50mb' }));
        // this.express.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 100000 }));
        this.express.use(helmet())
        const corsOptions = {
            origin: [
                "http://localhost:3000", this.url],
            optionsSuccessStatus: 200, // For legacy browser support,
            credentials: true,
        };
        this.express.use(cors(corsOptions));
        this.express.use(compression())
        this.express.use(morgan('dev'))
        this.express.use(express.static(__dirname + '/public'));
        this.express.engine('html', ejs.renderFile);
        this.express.set('view engine', 'ejs');
        console.log(`**** Middleware set successfully ****`);
        //api.openboxkoncepts.com
        this.express.use('/.well-known/acme-challenge/x_SLgcRJUgUxgasfxnnGdS9yMoEZAUZlmavcefcPjss', (req, res) => {
            try {
                res.send("x_SLgcRJUgUxgasfxnnGdS9yMoEZAUZlmavcefcPjss.5AMUXR7QSFE3WjrcuI5CEuc2VeLgpcbqq5G0Q4iVGGg")
            } catch (error) {
                console.log('error', error);
            }
        });
    }


    private initControllers(controllers: Controller[]): void {
        controllers.forEach((controller: Controller) => {
            this.express.use('/v1', controller.router)
        });
        console.log(`**** Controller connection successfully ****`);
    }

    private initErrorHanding(): void {
        this.express.use(ErrorMiddleware);
        console.log(`**** ErrorMiddleware set successfully ****`);
    }


    // public listen(): void {
    //     this.express.listen(this.port, () => {
    //         console.log(`**** App listening http on port ${this.port} ****`);
    //     })
    // }

    public listen(): void {
        try {
            if (process.env.NODE_ENV === 'production') {


                // Certificate
                const privateKey = fs.readFileSync('/etc/letsencrypt/live/wa-api.colorzweb.com/privkey.pem', 'utf8');
                const certificate = fs.readFileSync('/etc/letsencrypt/live/wa-api.colorzweb.com/cert.pem', 'utf8');
                const ca = fs.readFileSync('/etc/letsencrypt/live/wa-api.colorzweb.com/fullchain.pem', 'utf8');

                const credentials = {
                    key: privateKey,
                    cert: certificate,
                    ca: ca
                };
                https.createServer(credentials, this.express).listen(this.securePort, () => {
                    console.log(`**** App listening on https secure port ${this.securePort} ****`);
                })
            } else {
                this.express.listen(this.port, () => {
                    console.log(`**** App listening http on port ${this.port} ****`);
                })
            }
        } catch (error) {
            console.log(error, "Error crating https connection");
        }

    }

    private initSwagger(): void {
        this.express.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
        console.log(`**** Swagger set successfully ****`);
    }

    private initDatabase(): void {
        const { MONGO_PATH } = process.env;
        mongoose.set('strictQuery', false)
        mongoose.connect(`mongodb://${MONGO_PATH}`, {
            socketTimeoutMS: 50000,
            keepAlive: true
        }).then(con => {
            console.log(`**** DB connect at host ${con.connection.host} ****`);

        })
    }
}

export default App;