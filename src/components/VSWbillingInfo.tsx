import { PublicNoteData, cn, getDaysBetweenDatesWithAutoRenewal } from "@/lib/VSWutils"
import { useTranslation } from "react-i18next"

import RemainPercentBar from "./RemainPercentBar"

export default function BillingInfo({ parsedData }: { parsedData: PublicNoteData }) {
  const { t } = useTranslation()
  if (!parsedData || !parsedData.billingDataMod) {
    return null
  }

  let isNeverExpire = false
  let daysLeftObject = {
    days: 0,
    cycleLabel: "",
    remainingPercentage: 0,
    remainingPrice: "0.00"
  }

  if (parsedData?.billingDataMod?.endDate) {
    if (parsedData.billingDataMod.endDate.startsWith("0000-00-00")) {
      isNeverExpire = true
    } else {
      try {
        daysLeftObject = getDaysBetweenDatesWithAutoRenewal(parsedData.billingDataMod)
      } catch (error) {
        console.error(error)
        return (
          <div className={cn("text-[10px] text-muted-foreground text-red-600")}>
            {t("billingInfo.remaining")}: {t("billingInfo.error")}
          </div>
        )
      }
    }
  }

  return daysLeftObject.days >= 0 ? (
    <>
      <div className={cn("flex flex-row justify-start")}>
        {parsedData.billingDataMod.amount && parsedData.billingDataMod.amount !== "0" && parsedData.billingDataMod.amount !== "-1" ? (
          <p className={cn("text-[10px] text-muted-foreground ")}>
            {t("billingInfo.price")}: {parsedData.billingDataMod.amount}/{parsedData.billingDataMod.cycle}
          </p>
        ) : parsedData.billingDataMod.amount === "0" ? (
          <p className={cn("text-[10px] text-green-600 ")}>{t("billingInfo.free")}</p>
        ) : parsedData.billingDataMod.amount === "-1" ? (
          <p className={cn("text-[10px] text-pink-600 ")}>{t("billingInfo.usage-baseed")}</p>
        ) : null}

        {parsedData?.billingDataMod?.link ? (
          <a
            href={parsedData.billingDataMod.link}
            onClick={(event) => event.stopPropagation()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex align-middle ml-1 text-sm font-medium opacity-50 transition-opacity hover:opacity-100 dark:text-white"
          >
            <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="27892" width="12" height="12"><path d="M347.136 783.36q19.456 0 36.864 7.168t30.72 19.968 20.48 30.208 7.168 36.864-7.168 36.864-20.48 30.208-30.72 20.48-36.864 7.68q-20.48 0-37.376-7.68t-30.208-20.48-20.48-30.208-7.168-36.864 7.168-36.864 20.48-30.208 30.208-19.968 37.376-7.168zM773.12 785.408q19.456 0 37.376 7.168t30.72 19.968 20.48 30.208 7.68 36.864-7.68 36.864-20.48 30.208-30.72 20.48-37.376 7.68-36.864-7.68-30.208-20.48-20.48-30.208-7.68-36.864 7.68-36.864 20.48-30.208 30.208-19.968 36.864-7.168zM945.152 203.776q28.672 0 44.544 7.68t22.528 18.944 6.144 24.064-3.584 22.016-12.8 37.888-22.016 62.976-24.064 68.096-17.92 53.248q-13.312 40.96-33.792 56.832t-50.176 15.872l-34.816 0-66.56 0-87.04 0-95.232 0-253.952 0 15.36 92.16 516.096 0q49.152 0 49.152 41.984 0 20.48-9.728 35.328t-38.4 14.848l-49.152 0-95.232 0-117.76 0-119.808 0-98.304 0-56.32 0q-20.48 0-34.304-9.216t-23.04-24.064-14.848-32.256-8.704-32.768q-1.024-6.144-5.632-29.696t-11.264-58.88-14.848-78.848-16.384-87.552q-19.456-103.424-44.032-230.4l-76.8 0q-15.36 0-25.6-7.68t-16.896-18.432-9.216-23.04-2.56-22.528q0-20.48 13.824-33.792t37.376-13.312l22.528 0 20.48 0 25.6 0 34.816 0q20.48 0 32.768 6.144t19.456 15.36 10.24 19.456 5.12 17.408q2.048 8.192 4.096 23.04t4.096 30.208q3.072 18.432 6.144 38.912l700.416 0z" p-id="27893" className="fill-current"></path></svg>
          </a>
          ) : null }
      </div>
      <div className={cn("text-[10px] text-muted-foreground")}>
        {t("billingInfo.remaining")}: {isNeverExpire ? t("billingInfo.indefinite") : daysLeftObject.days + " " + t("billingInfo.days") + " / " + daysLeftObject.remainingPrice}
      </div>
      {!isNeverExpire && <RemainPercentBar className="mt-0.5" value={daysLeftObject.remainingPercentage * 100} />}
    </>
  ) : (
    <>
      {parsedData.billingDataMod.amount && parsedData.billingDataMod.amount !== "0" && parsedData.billingDataMod.amount !== "-1" ? (
        <p className={cn("text-[10px] text-muted-foreground ")}>
          {t("billingInfo.price")}: {parsedData.billingDataMod.amount}/{parsedData.billingDataMod.cycle}
        </p>
      ) : parsedData.billingDataMod.amount === "0" ? (
        <p className={cn("text-[10px] text-green-600 ")}>{t("billingInfo.free")}</p>
      ) : parsedData.billingDataMod.amount === "-1" ? (
        <p className={cn("text-[10px] text-pink-600 ")}>{t("billingInfo.usage-baseed")}</p>
      ) : null}
      <p className={cn("text-[10px] text-muted-foreground text-red-600")}>
        {t("billingInfo.expired")}: {daysLeftObject.days * -1} {t("billingInfo.days")}
      </p>
    </>
  )
}
