import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadBufferToCloudinary(buffer: Buffer, fileName: string) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "logicbiz-dev",
        public_id: fileName.replace(/\.[^.]+$/, ""),
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error("No se recibió respuesta de Cloudinary"));
          return;
        }

        resolve(result);
      }
    );

    stream.write(buffer);
    stream.end();
  });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Debes enviar un archivo en el campo 'file'." },
        { status: 400 }
      );
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: "Faltan variables CLOUDINARY_* en el entorno." },
        { status: 500 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const data = (await uploadBufferToCloudinary(buffer, file.name)) as any;

    return NextResponse.json({
      public_id: data.public_id,
      url: data.secure_url,
      original: data.original_filename,
      width: data.width,
      height: data.height,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "No se pudo subir la imagen.", details: String(error) },
      { status: 500 }
    );
  }
}
