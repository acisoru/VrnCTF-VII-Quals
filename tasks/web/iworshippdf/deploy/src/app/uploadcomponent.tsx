'use client'

import {GetProp, UploadFile, UploadProps, Image as AntImage, Upload, Button} from "antd";
import {useState} from "react";
import {PlusCircle} from "lucide-react";
import toast, {Toaster} from "react-hot-toast";
import axios from "axios";

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });


export const UploadComponent = () => {

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [fileList, setFileList] = useState<UploadFile[]>([])

    const [isLoading, setLoading] = useState<boolean>(false)


    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as FileType);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };

    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) =>
        setFileList(newFileList);

    const uploadButton = (
        <button className="border-0 bg-transparent" type="button">
            <PlusCircle className="mx-auto" />
            <div className="mt-4">Добавить</div>
        </button>
    );

    const checkFile = async (file: FileType) => {
        if (file.size > 1024*1024*10) {
            toast.error("Изображение должно быть не больше 10 Мб")
            return false
        }
        if (!["image/png","image/jpeg","image/jpg"].includes(file.type)) {
            toast.error("Неверный формат изображения (Требуется png, jpg или jpeg)")
            return false
        }
        return file
    }

    const convertFiles = async () => {
        const list = fileList.map(f=>f.response.file as string)
        try {
            const {data} = await axios.post<{url: string}>("/api/convert", {
                files: list
            })

            toast("Все готово!")
            setTimeout(()=>window.location.href = data.url, 1500)
        } catch (e) {
            toast.error((e as Error).message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Toaster />
            <Upload
                beforeUpload={checkFile}
                accept="image/*"
                action="/api/upload"
                listType="picture-card"
                fileList={fileList}
                onPreview={handlePreview}
                onChange={handleChange}
            >
                {fileList.length < 8 && uploadButton}
            </Upload>
            {fileList.length > 0 && <Button loading={isLoading} type="primary" size="large" onClick={()=>convertFiles()}>Конвертировать</Button> }
            {previewImage && (
                <AntImage
                    wrapperStyle={{ display: 'none' }}
                    preview={{
                        visible: previewOpen,
                        onVisibleChange: (visible) => setPreviewOpen(visible),
                        afterOpenChange: (visible) => !visible && setPreviewImage(''),
                    }}
                    src={previewImage}
                />
            )}
        </>
    )
}