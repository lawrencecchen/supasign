import clsx from "clsx";
import { useEffect, useState } from "react";
import { pdfjs } from "react-pdf";

async function* getImageUrls(fileUrl: string) {
  if (typeof window === "undefined") {
    return null;
  }
  const pdf = await pdfjs.getDocument(fileUrl).promise;
  const scale = 1.5;
  const outputScale = window.devicePixelRatio || 1;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  for (let i = 1; i <= pdf.numPages; ++i) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = Math.floor(viewport.width) + "px";
    canvas.style.height = Math.floor(viewport.height) + "px";
    const transform =
      outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : [];

    if (context) {
      const renderContext = {
        canvasContext: context,
        transform: transform,
        viewport: viewport,
      };
      await page.render(renderContext).promise;
      yield canvas.toDataURL("image/jpeg");
    }
  }
}

const PagesPreviewPane = ({
  currentPage,
  totalPages,
  fileUrl,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  fileUrl: string;
  onPageChange: (pageNumber: number) => void;
}) => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      for await (const imageUrl of getImageUrls(fileUrl)) {
        setImageUrls((imageUrls) => [...imageUrls, imageUrl]);
      }
    })();
  }, []);

  function handleClick(pageNumber: number) {
    onPageChange(pageNumber + 1);
  }

  return (
    <div className="flex flex-row border-l bg-white">
      <div className="w-full flex flex-col max-h-full overflow-auto">
        <div className="font-bold text-sm px-4 pt-3">Pages</div>
        <div className="px-4 space-y-2 w-full">
          {imageUrls.map((imageUrl, index) => (
            <button
              className={clsx(
                "border relative hover:border-blue-600 transition aspect-w-8 aspect-h-11 w-full",
                {
                  "ring-1 ring-blue-600 border-blue-600":
                    index + 1 === currentPage,
                }
              )}
              onClick={() => handleClick(index)}
              key={`page_${index + 1}`}
            >
              <img src={imageUrl} alt={`Page ${index + 1}`} />
              <div className="bg-gray-500 text-white w-4 h-4 absolute top-auto left-auto right-1 bottom-1 rounded-sm text-[10px] grid place-items-center font-medium">
                {index + 1}
              </div>
            </button>
          ))}
          {Array.from(new Array(totalPages - imageUrls.length)).map(
            (_el, index) => (
              <button
                className={clsx(
                  "border relative hover:border-blue-600 transition aspect-w-8 aspect-h-11 w-full",
                  {
                    "ring-1 ring-blue-600 border-blue-600":
                      imageUrls.length + index + 1 === currentPage,
                  }
                )}
                onClick={() => handleClick(index)}
                key={`page_${imageUrls.length + index + 1}`}
              >
                <div className="bg-gray-50 animate-pulse w-full h-full">
                  <div className="sr-only">Loading...</div>
                </div>
                <div className="bg-gray-500 text-white w-4 h-4 absolute top-auto left-auto right-1 bottom-1 rounded-sm text-[10px] grid place-items-center font-medium">
                  {imageUrls.length + index + 1}
                </div>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default PagesPreviewPane;
