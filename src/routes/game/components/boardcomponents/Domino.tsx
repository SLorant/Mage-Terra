import { FC, useEffect, memo, useRef } from "react";
import { useDrag, useDragLayer } from "react-dnd";
import { ItemTypes } from "../../../../types/ItemTypes";
import {} from "react-dnd";
import { DominoProps } from "@/src/components/Interfaces";

export const DominoComponent: FC<DominoProps> = memo(function Domino({
  firstname,
  secondname,
  isDropped,
  setIsActive,
  img,
  secondimg,
  isTurned,
  setDirection,
  setLeftSqIndex,
  isDominoPicked,
}) {
  const dominoRef = useRef<HTMLDivElement>(null);
  const [{ opacity, isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypes.DOMINO,
      item: { firstname, secondname, img, secondimg },
      canDrag: !isDropped,
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.5 : 1,
        isDragging: monitor.isDragging() ? true : false,
        canDrag: monitor.canDrag() ? true : false,
      }),
    }),
    [firstname, secondname, img, secondimg, isDropped]
  );
  useEffect(() => {
    if (!isDragging) {
      setIsActive(false);
      setLeftSqIndex(-1);
    }
  }, [isDragging]);

  const { currentOffset } = useDragLayer((monitor) => ({
    currentOffset: monitor.getInitialClientOffset(),
  }));

  const getCursorPosition = (x: number) => {
    if (dominoRef.current) {
      const dominoRect = dominoRef.current.getBoundingClientRect();
      const dominoCenterX = dominoRect.left + dominoRect.width / 2;
      const dominoCenterY = dominoRect.top + dominoRect.height / 2 + 10;
      if (isTurned) {
        const position = x > dominoCenterY ? "down" : "top";
        return position;
      } else {
        const position = x > dominoCenterX ? "right" : "left";
        return position;
      }
    }
    return "";
  };
  useEffect(() => {
    if (isTurned) {
      const temp = currentOffset && getCursorPosition(currentOffset.y);
      temp && setDirection(temp);
    } else {
      const temp = currentOffset && getCursorPosition(currentOffset.x);
      temp && setDirection(temp);
    }
  }, [currentOffset]);
  return (
    <div
      className={`${isTurned ? "h-[14.5vh] md:h-[22vh] " : "w-[22vh]"}   ${
        (isDropped || !isDominoPicked) && "opacity-50"
      }  flex ml-0 justify-center items-center`}
    >
      <div
        ref={dominoRef}
        className={`${
          isTurned
            ? "h-[14.5vh] md:h-[22vh] md:mb-20"
            : "w-[14.5vh] md:w-[22vh]"
        } `}
      >
        <div
          ref={drag}
          id="domino"
          style={{ opacity, border: "1px dashed gray" }}
          className={`${
            isTurned ? "flex-col turneddomino mb-20" : " "
          } cursor-move flex  mt-6`}
        >
          <div
            className={` ring-2 bg-grey ring-gray-200 shadow-lg z-20 dominoimg`}
            data-testid="Domino"
          >
            <img
              src={img}
              alt="kep"
              width={80}
              height={80}
              className={`w-full h-full`}
              draggable="false"
            />
          </div>
          <div
            className={` ring-2 bg-grey ring-gray-200 shadow-lg z-20 dominoimg`}
            data-testid="Domino"
          >
            <img
              src={secondimg}
              alt="kep"
              width={80}
              height={80}
              className={`w-full h-full`}
              draggable="false"
            />
          </div>
        </div>
      </div>
    </div>
  );
});
