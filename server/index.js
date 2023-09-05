import Koa from 'koa'
import  Router  from 'koa-router'
import {koaBody} from 'koa-body'
import {chat } from './chat.js'
import {agent } from './agents.js'
const app = new Koa()






app.use(
    koaBody({
    multipart:true
}))



const router = new Router()
router.get("/",(lab)=>{
    lab.body = "hello servers"
})

router.post("/agent", async(lab)=>{
    const{message} = lab.request.body

    const result =  await agent(message)

    lab.body={
    data:result.output,
    state:1,
}
})

app.use(router.routes())





app.listen(8040,()=>{
    console.log("open server localhost:8040")
})
