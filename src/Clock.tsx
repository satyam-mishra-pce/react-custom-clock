import React, { useEffect, useMemo, useState } from "react";
import "./clock.css";
import { defaultFill } from "./utils";

/**
 * The properties for this option would not be applicable if `show` is set to `false`
 */
type Ancestorize<T> = { show: false } | ({ show?: true } & T);

type IsSubtype<T, K> = K extends T ? true : false;
type RemoveSubtype<T, K> = T extends K ? never : T;
type SetProperty<T, K extends string, V> = {
  [P in keyof T]: T[P]; // Keep existing properties
} & { [P in K]: V }; // Add/overwrite the specified property

type Strictify<T> =
  // Check if T is a union type
  T extends any
    ? // If T is a primitive type, return it as is
      T extends string | number | boolean | bigint | symbol | null | undefined
      ? T
      : // If T is a function, return it as is
      T extends (...args: any[]) => any
      ? T
      : // If T is an array, apply Strictify to the array elements
      T extends (infer U)[]
      ? Strictify<U>[]
      : // If T is an object, remove optionality and apply Strictify to each property
      T extends object
      ? { [K in keyof T]-?: Strictify<T[K]> }
      : // Fallback case: return the type as is (for completeness)
        T
    : never;

type BooleanifyAncestor<T> =
  // Check if T is a union type
  T extends any
    ? // If T is a primitive type, return it as is
      T extends string | number | boolean | bigint | symbol | null | undefined
      ? T
      : // If T is a function, return it as is
      T extends (...args: any[]) => any
      ? T
      : // If T is an array, apply Strictify to the array elements
      T extends (infer U)[]
      ? BooleanifyAncestor<U>[]
      : // If T is an object, remove optionality and apply Strictify to each property
      T extends object
      ? IsSubtype<T, { show: false }> extends true
        ? SetProperty<RemoveSubtype<T, { show: false }>, "show", boolean>
        : {
            [K in keyof T]: K extends "show"
              ? boolean
              : BooleanifyAncestor<T[K]>;
          }
      : // Fallback case: return the type as is (for completeness)
        T
    : never;

/**
 * Represents the levels of ticks on the clock, which can be regular, secondary, or primary.
 */
type TickLevel = "regular" | "secondary" | "primary";

/**
 * Options to configure the appearance of individual ticks on the clock.
 * Includes properties such as height, width, background color, and radius.
 */
type TickOptions = Ancestorize<{
  /**
   * The height (px) of the tick (optional).
   */
  height?: number;

  /**
   * The width (px) of the tick (optional).
   */
  width?: number;

  /**
   * The background color of the tick (optional).
   * Any css value is accepted. Example: "black", "rgb(0 0 0 / 0.5)", "linear-gradient()"
   */
  background?: string;

  /**
   * The border radius (px) of the tick (optional).
   */
  radius?: number;
}>;

/**
 * Configuration options for multiple levels of ticks (markings) on the clock.
 * Each tick level (regular, secondary, primary) can be customized with its own options.
 */
type TicksOptions = Ancestorize<{
  /**
   * Options to configure the appearance like height, width, etc. of the ticks (markings) of this level.
   */
  [key in TickLevel]?: TickOptions;
}>;

/**
 * Options to configure the appearance of the count numbers on the clock (e.g., hour markers).
 * Includes properties such as size, color, background color, and gap of count from corresponding tick.
 */
type CountOptions = Ancestorize<{
  /**
   * The height and width (px) combined of the count numbers (optional).
   */
  size?: number;

  /**
   * The color of the count numbers (optional).
   * Any css value is accepted. Example: "black", "rgb(0 0 0 / 0.5)", "linear-gradient()"
   */
  color?: string;

  /**
   * The background color of the count numbers (optional).
   * Any css value is accepted. Example: "black", "rgb(0 0 0 / 0.5)", "linear-gradient()"
   */
  background?: string;

  /**
   * The gap (px) between the count numbers and their corresponding tick in the clock (optional).
   */
  gap?: number;
}>;

/**
 * Represents the levels of counts on the clock, excluding the regular tick level.
 */
type CountLevel = Exclude<TickLevel, "regular">;

/**
 * Configuration options for multiple levels of counts on the clock.
 * Each count level (secondary, primary) can be customized with its own options.
 */
type CountsOptions = Ancestorize<Partial<Record<CountLevel, CountOptions>>>;

/**
 * Options to configure the appearance of the clock face.
 * Includes background color, padding, and options for ticks and counts.
 */
type FaceOptions = Ancestorize<{
  /**
   * The background color of the clock face (optional).
   * Any css value is accepted. Example: "black", "rgb(0 0 0 / 0.5)", "linear-gradient()"
   */
  background?: string;

  /**
   * The padding (px) around the edge of clock face (optional).
   */
  padding?: number;

  /**
   * The configuration options for ticks on the clock face (optional).
   */
  ticks?: TicksOptions;

  /**
   * The configuration options for count numbers on the clock face (optional).
   */
  counts?: CountsOptions;
}>;

/**
 * Options to configure the appearance of the clock's central pivot point.
 * Includes size and background color.
 */
type PivotOptions = Ancestorize<{
  /**
   * The height and width (px) combined of the clock's pivot point (optional).
   */
  size?: number;

  /**
   * The background color of the pivot point (optional).
   * Any css value is accepted. Example: "black", "rgb(0 0 0 / 0.5)", "linear-gradient()"
   */
  background?: string;
}>;

/**
 * Represents the possible time units that can be displayed on the clock (hour, minute, second).
 */
type TimeUnit = "hour" | "minute" | "second";

/**
 * A type that represents the different clock hands for time units (e.g., hourHand, minuteHand, secondHand).
 */
type ClockHandName = `${TimeUnit}Hand`;

/**
 * Represents the different subparts of a clock hand, such as front, frontBase, and back.
 */
type HandSubPart = "front" | "frontBase" | "back";

/**
 * Options to configure the appearance of a specific subpart of a clock hand.
 * This includes properties like alignment, background color, radius, width, and height.
 */
type HandSubPartOptions<T extends HandSubPart> = Ancestorize<
  (T extends "front"
    ? {
        /**
         * Alignment of the front part of the clock hand (optional).
         * Can be aligned to the PIVOT, TICK, or CENTER.
         * `"PIVOT"` aligns the front part towards the center of the clock.
         * `"TICK"` aligns the front part towards the edge of the clock.
         * `"CENTER"` aligns the front part towards the center of the pivot and edge.
         */
        alignment: "PIVOT" | "TICK" | "CENTER";
      }
    : {}) & {
    /**
     * The background color of the clock hand subpart (optional).
     * Any css value is accepted. Example: "black", "rgb(0 0 0 / 0.5)", "linear-gradient()"
     */
    background?: string;

    /**
     * The border radius (px) of the clock hand subpart (optional).
     */
    radius?: number;

    /**
     * The width (px) of the clock hand subpart (optional).
     */
    width?: number;

    /**
     * The height (px) of the clock hand subpart (optional).
     */
    height?: number;
  }
>;

/**
 * Options to configure the appearance of the clock hands (hour, minute, second).
 * Each hand can be customized with properties like front, frontBase, and back.
 * frontBase is the base of the front part, that lies below the front part itself.
 * front and back are the subparts of clock hand and are as their names sugges.
 */
type ClockHandOptions = Ancestorize<{
  [K in HandSubPart]?: HandSubPartOptions<K>;
}>;

/**
 * Options to configure the clock's interface behavior and appearance.
 * Includes properties like dynamic behavior, discrete time display, transition speed, and pivot options.
 */
type InterfaceOptions = Ancestorize<
  {
    /**
     * Enables or disables automatic time updates every second on the clock interface.
     * If true, the clock will automatically update to reflect the current time each second.
     * If false, the time will remain static and not update automatically.
     */
    dynamic?: boolean;

    /**
     * Transition duration (ms) for hand movements (optional).
     */
    transition?: number;

    /**
     * Options to configure the clock's pivot point (optional).
     */
    pivot?: PivotOptions;
  } & Partial<Record<ClockHandName, ClockHandOptions>>
>;

/**
 * Main configuration options for the Clock component.
 * Customize the size, face, and interface of the clock.
 */
export type ClockOptions = {
  /**
   * The height and width (px) combined of the clock (optional).
   */
  size?: number;

  /**
   * Options to configure the appearance of the clock face (optional).
   */
  face?: FaceOptions;

  /**
   * Options to configure the behavior and appearance of the clock interface (optional).
   */
  interface?: InterfaceOptions;
};

type StrictClockOptions = Strictify<ClockOptions>;

const OPTIONS: StrictClockOptions = {
  size: 400,
  face: {
    background: "white",
    show: true,
    padding: 0,
    ticks: {
      show: true,
      regular: {
        show: true,
        height: 20,
        width: 4,
        background: "rgb(200 200 200)",
        radius: 2,
      },
      secondary: {
        show: true,
        height: 28,
        width: 4,
        background: "black",
        radius: 2,
      },
      primary: {
        show: true,
        height: 36,
        width: 8,
        background: "rgb(0 122 255)",
        radius: 3,
      },
    },
    counts: {
      show: true,
      secondary: {
        show: true,
        size: 20,
        color: "rgb(100 100 100)",
        background: "rgb(0 122 255 / 0)",
        gap: 5,
      },
      primary: {
        show: true,
        size: 25,
        color: "black",
        background: "rgb(0 122 255 / 0.08)",
        gap: 5,
      },
    },
  },

  interface: {
    show: true,
    dynamic: true,
    transition: 300,
    pivot: {
      show: true,
      size: 20,
      background: "rgb(0 0 0)",
    },
    hourHand: {
      show: true,
      front: {
        show: true,
        background: "black",
        radius: 4,
        width: 12,
        height: 80,
        alignment: "CENTER",
      },
      frontBase: {
        show: true,
        background: "grey",
        radius: 2,
        width: 4,
        height: 120,
      },
      back: {
        show: true,
        background: "grey",
        radius: 2,
        width: 4,
        height: 24,
      },
    },
    minuteHand: {
      show: true,
      front: {
        show: true,
        background: "black",
        radius: 4,
        width: 8,
        height: 120,
        alignment: "TICK",
      },
      frontBase: {
        show: true,
        background: "grey",
        radius: 2,
        width: 4,
        height: 150,
      },
      back: {
        show: true,
        background: "grey",
        radius: 2,
        width: 4,
        height: 30,
      },
    },
    secondHand: {
      show: true,
      front: {
        show: true,
        background: "red",
        radius: 4,
        width: 6,
        height: 120,
        alignment: "CENTER",
      },
      frontBase: {
        show: true,
        background: "orange",
        radius: 2,
        width: 4,
        height: 150,
      },
      back: {
        show: true,
        background: "grey",
        radius: 2,
        width: 4,
        height: 30,
      },
    },
  },
};

const Tick = ({
  radius,
  background,
}: {
  radius: number;
  background: string;
}) => {
  return (
    <div
      className="tick"
      style={
        {
          "--radius": `${radius}px`,
          "--background": `${background}`,
        } as React.CSSProperties
      }
    ></div>
  );
};

const Count = ({
  number,
  counts,
  level,
}: {
  number: number;
  counts: BooleanifyAncestor<Strictify<CountsOptions>>;
  level: CountLevel;
}) => {
  const countByLevel = counts[level];

  return (
    <span
      className="tick-count"
      style={
        {
          "--color": `${countByLevel.color}`,
          "--background": `${countByLevel.background}`,
          "--size": `${countByLevel.size}px`,
          "--gap": `${countByLevel.gap}px`,
        } as React.CSSProperties
      }
    >
      {number}
    </span>
  );
};

const PerimeterPlacer = ({
  ticks,
  apparentClockRadius,
  counts,
}: {
  ticks: BooleanifyAncestor<Strictify<TicksOptions>>;
  apparentClockRadius: number;
  counts: BooleanifyAncestor<Strictify<CountsOptions>>;
}) => {
  const totalTicks = 60;
  const degPerTick = 360 / totalTicks;
  const primaries = new Set([0, 3, 6, 9]);

  const levelByIndex: TickLevel[] = ["regular", "secondary", "primary"];

  const tickByLevelIndex: Array<BooleanifyAncestor<Strictify<TickOptions>>> =
    [];

  for (let i = 0; i < 3; i++) {
    const tick = ticks[levelByIndex[i]];
    tickByLevelIndex.push(tick);
  }

  // CTH : center to tick hypotenuse
  const cthByLevelIndex: number[] = [];
  for (let i = 0; i < 3; i++) {
    const tick = tickByLevelIndex[i];
    cthByLevelIndex.push(apparentClockRadius - tick.height / 2);
  }

  const mapper = new Array(totalTicks).fill(0);
  const showRegularTicks = tickByLevelIndex[0].show;

  return (
    <>
      {mapper.map((_, i) => {
        const deg = degPerTick * i;
        const levelIndex = primaries.has(i / 5) ? 2 : i % 5 === 0 ? 1 : 0;
        const cth = cthByLevelIndex[levelIndex];
        if (levelIndex === 0 && !showRegularTicks) return null;

        return (
          <div
            className="perimeter-placer"
            data-tick-index={i}
            key={i}
            style={
              {
                "--center-to-tick-hypotenuse": `${cth}px`,
                "--degree": `${deg}deg`,
                "--tick-height": `${
                  tickByLevelIndex[levelIndex].show
                    ? tickByLevelIndex[levelIndex].height
                    : 0
                }px`,
                "--tick-width": `${
                  tickByLevelIndex[levelIndex].show
                    ? tickByLevelIndex[levelIndex].width
                    : 0
                }px`,
              } as React.CSSProperties
            }
          >
            <Tick
              radius={tickByLevelIndex[levelIndex].radius}
              background={tickByLevelIndex[levelIndex].background}
            />
            {counts.show && levelIndex !== 0 && (
              <Count
                number={(i === 0 ? 60 : i) / 5}
                counts={counts}
                level={levelIndex === 1 ? "secondary" : "primary"}
              />
            )}
          </div>
        );
      })}
    </>
  );
};

const ClockHand = ({
  clockHand,
  degrees,
  pivotSize,
  transition,
  ...props
}: {
  clockHand: BooleanifyAncestor<Strictify<ClockHandOptions>>;
  degrees: number;
  pivotSize: number;
  transition: number;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const handSubParts: HandSubPart[] = useMemo(
    () => ["back", "frontBase", "front"],
    []
  );
  const handSubPartClassNames: string[] = useMemo(
    () => ["back", "front-base", "front"],
    []
  );

  const { height: frontBaseHeight, width: frontBaseWidth } =
    clockHand.frontBase;
  const { height: frontHeight, alignment } = clockHand.front;
  const { height: backHeight, width: backWidth } = clockHand.back;

  const frontAlignmentTranslation = useMemo(() => {
    return alignment === "PIVOT"
      ? frontHeight - frontBaseHeight
      : alignment === "CENTER"
      ? (frontHeight + pivotSize / 2 - frontBaseHeight) / 2
      : 0;
  }, [alignment, frontHeight, frontBaseHeight, pivotSize]);

  const resolvedHandWidth = useMemo(
    () => Math.max(frontBaseWidth, backWidth),
    [frontBaseWidth, backWidth]
  );
  return (
    <div
      {...props}
      style={
        {
          "--hand-height": `${backHeight + frontBaseHeight}px`,
          "--hand-width": `${resolvedHandWidth}px`,
          "--hand-back-height": `${backHeight}px`,
          "--hand-rotate": `${degrees}deg`,
          "--transition": `${transition}ms`,
          "--hand-origin": `50% calc(100% - ${backHeight}px)`,
          ...(props.style ?? {}),
        } as React.CSSProperties
      }
    >
      {handSubParts.map((handSubPart, i) => {
        return (
          <div
            className={handSubPartClassNames[i]}
            key={i}
            aria-hidden={!clockHand[handSubPart].show}
            style={
              {
                opacity: clockHand[handSubPart].show ? "" : 0,
                pointerEvents: clockHand[handSubPart].show ? "" : "none",
                "--hand-background": clockHand[handSubPart].background,
                "--hand-radius": `${clockHand[handSubPart].radius}px`,
                "--hand-width": `${clockHand[handSubPart].width}px`,
                "--hand-height": `${clockHand[handSubPart].height}px`,
                ...(handSubPart === "front"
                  ? {
                      "--hand-translate": `${-frontAlignmentTranslation}px`,
                    }
                  : {}),
              } as React.CSSProperties
            }
          ></div>
        );
      })}
    </div>
  );
};

const ClockInterface = ({
  clockInterface,
  time,
}: {
  clockInterface: BooleanifyAncestor<Strictify<InterfaceOptions>>;
  time: Date;
}) => {
  const [degRotations, setDegRotations] = useState<{
    [key in TimeUnit]: number;
  }>({
    hour: 0,
    minute: 0,
    second: 0,
  });

  const { dynamic, pivot } = clockInterface;
  const pivotSize = pivot.show ? pivot.size : 0;

  useEffect(() => {
    if (!dynamic) return;
    // Initialize the rotation degrees based on the initial time prop
    const initialHourDeg =
      ((time.getHours() % 12) / 12) * 360 + (time.getMinutes() / 60) * 30;
    const initialMinuteDeg =
      (time.getMinutes() / 60) * 360 + (time.getSeconds() / 60) * 6;
    const initialSecondDeg = (time.getSeconds() / 60) * 360;

    setDegRotations({
      hour: initialHourDeg,
      minute: initialMinuteDeg,
      second: initialSecondDeg,
    });

    // Update the rotation every second
    const interval = setInterval(() => {
      setDegRotations((prev) => ({
        hour: prev.hour + 1 / 120, // 0.5 degrees per minute (30° per hour)
        minute: prev.minute + 0.1, // 6 degrees per minute
        second: prev.second + 6, // 360° per minute
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [time, dynamic]);

  return (
    <div className="interface">
      {(Object.keys(degRotations) as TimeUnit[]).map((handName) => {
        return (
          <ClockHand
            clockHand={clockInterface[`${handName}Hand`]}
            degrees={degRotations[handName]}
            pivotSize={pivotSize}
            transition={clockInterface.transition}
            className={`${handName}-hand clock-hand`}
            key={handName}
          />
        );
      })}
      {pivot.show && (
        <div
          className="pivot"
          style={
            {
              "--pivot-height": `${pivot.size}px`,
              "--pivot-background": `${pivot.background}`,
            } as React.CSSProperties
          }
        ></div>
      )}
    </div>
  );
};

const Clock = ({
  options,
  time,
  children,
}: {
  /**
   * The options object that define the appearance of the clock, and its parts.
   */
  options?: ClockOptions;
  /**
   * A `Date` object that would be used to display time on the clock.
   */
  time?: Date;
  /**
   * Anything that you want to be rendered on the clock face, behind the ticks and clock hands.
   */
  children?: React.ReactNode;
}) => {
  const normalizedOptions = defaultFill(
    OPTIONS,
    options ?? {}
  ) as BooleanifyAncestor<StrictClockOptions>;

  const {
    size,
    face: { ticks: ticksOptions, counts: countsOptions, padding, background },
    interface: interfaceOptions,
  } = normalizedOptions;

  const apparentClockRadius = size / 2 - padding;

  const [date, setDate] = useState(time ? time : new Date());
  useEffect(() => {
    setDate(time ?? new Date());
    if (time) return;
    const handleVisibilityChange = () => {
      console.log("Visibility change");
      if (document.hidden) return;
      console.log("Clock updated");
      setDate(new Date());
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [time]);

  return (
    <div
      className="--custom-analog-clock-react"
      style={
        {
          "--clock-size": `${size}px`,
          "--clock-background": background,
        } as React.CSSProperties
      }
    >
      {children ? children : null}
      {ticksOptions.show && (
        <PerimeterPlacer
          ticks={ticksOptions}
          apparentClockRadius={apparentClockRadius}
          counts={countsOptions}
        />
      )}
      <ClockInterface clockInterface={interfaceOptions} time={date} />
    </div>
  );
};

export default Clock;
