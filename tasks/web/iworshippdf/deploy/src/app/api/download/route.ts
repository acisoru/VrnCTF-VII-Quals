import fs from "node:fs";
import {FOLDER} from "@/app/api/paths";
import {Readable} from "node:stream";


export const GET = (req: Request) => {
    const {searchParams} = new URL(req.url)
    if (!searchParams.has("file") || !searchParams.get("file"))
        return Response.json({
            status: "error",
            message: "No file path provided"
        }, {status: 400})

    try {

        const filePath = `${FOLDER}${searchParams.get("file")}`
        console.log(filePath)
        if (!fs.existsSync(filePath)) {
            return Response.json({
                status: "error",
                message: "File not found"
            }, {status: 404})
        }

        const stream = fs.createReadStream(filePath)
        const webStream = Readable.toWeb(stream) as ReadableStream<Uint8Array>;

        return new Response(webStream, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${searchParams.get("file")}"`
            }
        })
    } catch (e) {
        return Response.json({
            status: "error",
            message: (e as Error).message
        }, {status: 500})
    }
}