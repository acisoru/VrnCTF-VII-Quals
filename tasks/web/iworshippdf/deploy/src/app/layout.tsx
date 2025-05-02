import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import {AntdRegistry} from '@ant-design/nextjs-registry';
import '@ant-design/v5-patch-for-react-19';
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "I worship PDF",
    description: "A site that allows you to convert images to PDF",
};

export default function RootLayout(
    {
        children,
    }: Readonly<{
        children: React.ReactNode;
    }>) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <AntdRegistry>{children}</AntdRegistry>
            </body>
        </html>
    );
}
