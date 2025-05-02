import fs from "node:fs"
import {FOLDER} from "@/app/api/paths";
import {v4} from "uuid";
import imageToPdf, {sizes} from "image-to-pdf";

export type FileBundle = {
    files: string[]
}

export const POST = async (req: Request) => {

    const {files} = await req.json() as FileBundle


    if(!files)
        return Response.json({
            status: "error",
            message: "No files to convert provided"
        }, {status: 400})

    const paths = files.map(f=>`${FOLDER}${f}`)
    for (const path of paths) {
        console.log(path)
        if (!fs.existsSync(path))
            return Response.json({
                status: "error",
                message: `Was unable to find file ${path}`
            })
    }

    const fname = `vrnctfpdf_yay_${v4()}.pdf`
    try {
        imageToPdf(paths, sizes.A4).pipe(fs.createWriteStream(`${FOLDER}/${fname}`))
    } catch (e) {
        return Response.json({
            status: "error",
            message: (e as Error).message
        }, {status: 400})
    }



    return Response.json({
        status: "ok",
        message: "YOU MAY ENTER, YOU ARE COFFE... PDF",
        url: `/api/download?file=${fname}`
    }, {status: 200})
}