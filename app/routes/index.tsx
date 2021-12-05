import React, { useState } from "react";
import type { MetaFunction, LoaderFunction } from "remix";
import { useLoaderData, json } from "remix";
import { Document, Outline, Page, pdfjs } from "react-pdf";
import { ArrowDownIcon, ArrowUpIcon, Pencil1Icon } from "@radix-ui/react-icons";
import PagesPreviewPane from "~/lib/components/PagesPreviewPane";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
// pdfjs.GlobalWorkerOptions.workerSrc = "pdf.worker.min.js";

type IndexData = {
  resources: Array<{ name: string; url: string }>;
  demos: Array<{ name: string; to: string }>;
};

// Loaders provide data to components and are only ever called on the server, so
// you can connect to a database or run any server side code you want right next
// to the component that renders it.
// https://remix.run/api/conventions#loader
export let loader: LoaderFunction = () => {
  let data: IndexData = {
    resources: [
      {
        name: "Remix Docs",
        url: "https://remix.run/docs",
      },
      {
        name: "React Router Docs",
        url: "https://reactrouter.com/docs",
      },
      {
        name: "Remix Discord",
        url: "https://discord.gg/VBePs6d",
      },
    ],
    demos: [
      {
        to: "demos/actions",
        name: "Actions",
      },
      {
        to: "demos/about",
        name: "Nested Routes, CSS loading/unloading",
      },
      {
        to: "demos/params",
        name: "URL Params and Error Boundaries",
      },
    ],
  };

  // https://remix.run/api/remix#json
  return json(data);
};

// https://remix.run/api/conventions#meta
export let meta: MetaFunction = () => {
  return {
    title: "Remix Starter",
    description: "Welcome to remix!",
  };
};

// https://remix.run/guides/routing#index-routes
export default function Index() {
  let data = useLoaderData<IndexData>();
  const [fileUrl, setFileUrl] = useState("/EE16A Preparation.pdf");
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setCurrentPage(1);
  }

  function changePage(offset: number) {
    setCurrentPage((prevPageNumber) => prevPageNumber + offset);
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  function handleChange(e) {
    const files = e.target.files;
    setFileUrl(URL.createObjectURL(files[0]));
  }

  return (
    <div>
      {!numPages && (
        <div className="p-4">
          <label htmlFor="document">Drop document here to get started.</label>

          <div>
            <input
              type="file"
              id="document"
              name="document"
              accept="image/*,.pdf"
              onChange={handleChange}
            />
          </div>
        </div>
      )}

      {fileUrl ? (
        <div className="h-screen flex flex-col">
          <div className="flex border-b py-1">
            <div className="flex items-center mx-auto">
              <div className="flex items-center">
                <span className="text-sm font-medium">
                  {currentPage || (numPages ? 1 : "--")} of {numPages || "--"}
                </span>
                <div className="ml-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={previousPage}
                    className="p-1 hover:bg-gray-100"
                    title="Previous Page"
                  >
                    <ArrowUpIcon />
                  </button>
                  <button
                    type="button"
                    disabled={!!numPages && currentPage >= numPages}
                    onClick={nextPage}
                    className="p-1 hover:bg-gray-100"
                    title="Next Page"
                  >
                    <ArrowDownIcon />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-grow max-h-full min-h-0 bg-gray-100 grid grid-cols-8 grid-rows-1 w-full">
            <div className="flex flex-row border-r bg-white">
              <div className="w-full">
                <div className="font-bold text-sm p-2">Standard Fields</div>
                <button className="p-2 text-sm flex items-center w-full hover:bg-gray-200 font-medium">
                  <Pencil1Icon className="mr-2" /> Signature
                </button>
              </div>
            </div>

            <div className="flex-grow flex flex-col justify-center items-center col-span-6 max-h-full min-h-0 overflow-auto">
              <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
                <Page
                  pageNumber={currentPage}
                  renderTextLayer={false}
                  scale={1.2}
                />
              </Document>
            </div>

            {numPages && (
              <PagesPreviewPane
                currentPage={currentPage}
                totalPages={numPages}
                fileUrl={fileUrl}
                onPageChange={(newPage) => setCurrentPage(newPage)}
              />
            )}
          </div>
        </div>
      ) : (
        "Upload a file dimwit."
      )}
    </div>
  );
}
