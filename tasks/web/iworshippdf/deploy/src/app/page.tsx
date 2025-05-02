import Image from "next/image";

import ChillGuy from "@/images/chillguy.png"
import NeedPdf from "@/images/ineedpdf.jpg"
import KeepTalking from "@/images/yeahpdf.jpg"
import PDF from "@/images/THEPDF.png"
import Believe from "@/images/believe.png"
import {UploadComponent} from "@/app/uploadcomponent";

export default function Home() {
  return (
      <div className="flex flex-col gap-16 p-8 items-center">
          <div className="text-5xl font-bold flex items-center">
              I worship <Image src={PDF} alt="THE PDF ITSELF" className="w-24"/>
          </div>

          <UploadComponent />

          <div className="grid grid-cols-1 lg:max-w-5xl md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="flex flex-col items-center gap-4 p-4 rounded-xl bg-gray-100 shadow-2xl">
                  <Image src={NeedPdf} alt="I just need to convert this to PDF" className="w-full rounded-lg"/>
                  <p className="mt-auto font-semibold text-center">
                      Вы просыпаетесь посреди ночи, потому что забыли конвертировать картинки в PDF?
                  </p>
              </div>

              <div className="flex flex-col items-center gap-4 p-4 rounded-xl bg-gray-100 shadow-2xl">
                  <Image src={KeepTalking} alt="I just need to convert this to PDF" className="w-full rounded-lg"/>
                  <p className="mt-auto font-semibold text-center">
                      Постоянно сталкиваетесь с хейтерами лучшего формата файла в мире?
                  </p>
              </div>

              <div className="flex flex-col items-center gap-4 p-4 rounded-xl bg-gray-100 shadow-2xl">
                  <Image src={ChillGuy} alt="I just need to convert this to PDF" className="w-full rounded-lg"/>
                  <p className="mt-auto font-semibold text-center">
                      На работе вас окружают одни глупцы, которые не понимают превосходства PDF?
                  </p>
              </div>

              <div className="flex flex-col lg:flex-row lg:col-span-3 items-center gap-4 p-4 rounded-xl bg-gray-100 shadow-2xl">
                  <Image src={Believe} alt="I just need to convert this to PDF" className="w-full lg:w-64 rounded-lg"/>
                  <p className="mt-auto lg:my-auto lg:text-left font-semibold text-center">
                      Покажите им этот сайт! Он позволяет легко и быстро конвертировать изображения в PDF, который можно
                      открывать на любом устройстве!
                  </p>
              </div>
          </div>
          <a href="https://t.me/m4den" target="_blank" className="text-gray-300 text-sm hover:underline hover:text-gray-500 cursor-pointer">Developed by M41den for VRNCTF. Feel free to contact for hints)</a>
      </div>
  );
}
