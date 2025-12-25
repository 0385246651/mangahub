import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Comic } from "@/lib/types";
import { getImageUrl } from "@/lib/api";

interface RankingSidebarProps {
  comics: Comic[];
  cdnUrl: string;
}

export function RankingSidebar({ comics, cdnUrl }: RankingSidebarProps) {
  const topComics = comics.slice(0, 5);

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500 text-black";
      case 2:
        return "bg-gray-400 text-black";
      case 3:
        return "bg-amber-700 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="bg-card rounded-xl p-5 border border-border">
      <div className="flex items-center gap-2 mb-5">
        <svg
          className="h-5 w-5 text-yellow-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
        <h3 className="text-lg font-bold">Bảng Xếp Hạng</h3>
      </div>

      <div className="flex flex-col gap-4">
        {topComics.map((comic, index) => (
          <Link
            key={comic._id}
            href={`/truyen/${comic.slug}`}
            className="flex gap-4 group cursor-pointer hover:bg-muted p-2 -mx-2 rounded-lg transition-colors"
          >
            <div className="relative w-16 h-24 flex-shrink-0">
              <Badge
                className={`absolute -top-2 -left-2 z-10 size-6 flex items-center justify-center rounded-full border-2 border-card text-xs font-black ${getRankStyle(
                  index + 1
                )}`}
              >
                {index + 1}
              </Badge>
              <div className="relative w-full h-full rounded-md overflow-hidden">
                <Image
                  src={getImageUrl(cdnUrl, comic.thumb_url)}
                  alt={comic.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <h4 className="text-sm font-bold line-clamp-1 group-hover:text-primary transition-colors">
                {comic.name}
              </h4>
              <p className="text-muted-foreground text-xs mt-1 line-clamp-1">
                {comic.category?.slice(0, 2).map((c) => c.name).join(", ")}
              </p>
              {comic.updatedAt && (
                <p className="text-muted-foreground/60 text-[10px] mt-2">
                  {new Date(comic.updatedAt).toLocaleDateString("vi-VN")}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
