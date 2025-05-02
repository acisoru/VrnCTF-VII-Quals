import fs from 'node:fs'
import afs from 'node:fs/promises'
import {v4 as uuidv4} from "uuid";
import {Readable} from "node:stream";
import {ReadableStream as WebReadableStream} from "node:stream/web";
import {FOLDER} from "@/app/api/paths";

export const POST = async (req: Request) => {
    const form = await req.formData()
    const file = form.get('file')
    if (!(file && file instanceof File))
        return Response.json({
            status: "error",
            message: "No file uploaded"
        }, {status: 400})

    if (file.size > 1024*1024*10)
        return Response.json({
            status: "error",
            message: "Max file size is 10MB. Please do not bypass frontend checks"
        }, {status: 400})

    if (!["image/png","image/jpeg","image/jpg"].includes(file.type))
        return Response.json({
            status: "error",
            message: "Unsupported file format. Please do not bypass frontend checks"
        }, {status: 400})


    const extension = file.name.split('.').pop()
    if(!extension || !["png","jpg","jpeg"].includes(extension))
        return Response.json({
            status: "error",
            message: "Unsupported file extension. If you tried to upload shell, then its no use: backend is written in Node.js"
        }, {status: 400})


    const fname = `${uuidv4()}.${extension}`


    fs.mkdirSync(FOLDER, {recursive: true})
    const path = `${FOLDER}${fname}`
    const stream = file.stream() as unknown as WebReadableStream
    const nodeStream = Readable.fromWeb(stream) // i hate casting god know what into god know what
    await afs.writeFile(path, nodeStream)
    return Response.json({
        status: "success",
        message: "File uploaded successfully",
        file: fname
    })
}