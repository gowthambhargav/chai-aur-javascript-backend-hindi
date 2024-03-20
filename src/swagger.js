import SwaggerUI from 'swagger-ui-express'
import swaggerJSDoc from 'swagger-jsdoc'
import pkg from '../package.json' assert { type: 'json' };
const { version } = pkg;


const options = {
    definition:{
        openapi:"3.0.0" ,
        info:{
        titlel:"Teat api docs",
        version
    },
    components:{
        securitySchemas:{
            bearerAuth:{
                type:'http',
                scheme:'bearer',
                bearerFormat:"JWT"
            }
        }
    },
    security:[
        {
            bearerAuth:[], 
        }
    ]
    },
    apis: ['./routes/*.js']
}

const swaggerSpic = swaggerJSDoc(options)

function swaggerDoc(app,port){
    // Swagger page
    app.use('/docs',SwaggerUI.serve,SwaggerUI.setup(swaggerSpic))
    //Docs in json format
    app.get('docs.json',(req,res)=>{
        res.setheader('Content-Type','application/json')
        res.send(swaggerSpic)
    })
    console.log(`Docs available`);
}


export default swaggerDoc;











