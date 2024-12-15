import GlobalMap from "@/components/GlobalMap"
import GroupSwitch from "@/components/GroupSwitch"
import ServerCard from "@/components/ServerCard"
import ServerCardInline from "@/components/ServerCardInline"
import ServerOverview from "@/components/ServerOverview"
import { ServiceTracker } from "@/components/ServiceTracker"
import { Loader } from "@/components/loading/Loader"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useStatus } from "@/hooks/use-status"
import { useWebSocketContext } from "@/hooks/use-websocket-context"
import { fetchServerGroup } from "@/lib/nezha-api"
import { cn, formatNezhaInfo } from "@/lib/utils"
import { NezhaWebsocketResponse } from "@/types/nezha-api"
import { ServerGroup } from "@/types/nezha-api"
import { ChartBarSquareIcon, CogIcon, MapIcon, ViewColumnsIcon } from "@heroicons/react/20/solid"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

export default function Servers() {
  const { t } = useTranslation()
  const { data: groupData } = useQuery({
    queryKey: ["server-group"],
    queryFn: () => fetchServerGroup(),
  })
  const { lastMessage, connected } = useWebSocketContext()
  const { status } = useStatus()
  const [showServices, setShowServices] = useState<string>("0")
  const [showMap, setShowMap] = useState<string>("0")
  const [inline, setInline] = useState<string>("0")
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false)
  const [currentGroup, setCurrentGroup] = useState<string>("All")

  useEffect(() => {
    const showServicesState = localStorage.getItem("showServices")
    if (showServicesState !== null) {
      setShowServices(showServicesState)
    }
  }, [])

  useEffect(() => {
    const inlineState = localStorage.getItem("inline")
    if (inlineState !== null) {
      setInline(inlineState)
    }
  }, [])

  const groupTabs = ["All", ...(groupData?.data?.map((item: ServerGroup) => item.group.name) || [])]

  useEffect(() => {
    const hasShownToast = sessionStorage.getItem("websocket-connected-toast")
    if (connected && !hasShownToast) {
      toast.success(t("info.websocketConnected"))
      sessionStorage.setItem("websocket-connected-toast", "true")
    }
  }, [connected])

  if (!connected) {
    return (
      <div className="flex flex-col items-center min-h-96 justify-center ">
        <div className="font-semibold flex items-center gap-2 text-sm">
          <Loader visible={true} />
          {t("info.websocketConnecting")}
        </div>
      </div>
    )
  }

  const nezhaWsData = lastMessage ? (JSON.parse(lastMessage.data) as NezhaWebsocketResponse) : null

  if (!nezhaWsData) {
    return (
      <div className="flex flex-col items-center justify-center ">
        <p className="font-semibold text-sm">{t("info.processing")}</p>
      </div>
    )
  }

  let filteredServers =
    nezhaWsData?.servers?.filter((server) => {
      if (currentGroup === "All") return true
      const group = groupData?.data?.find(
        (g: ServerGroup) =>
          g.group.name === currentGroup &&
          Array.isArray(g.servers) &&
          g.servers.includes(server.id),
      )
      return !!group
    }) || []

  const totalServers = filteredServers.length || 0
  const onlineServers =
    filteredServers.filter((server) => formatNezhaInfo(nezhaWsData.now, server).online)?.length || 0
  const offlineServers =
    filteredServers.filter((server) => !formatNezhaInfo(nezhaWsData.now, server).online)?.length ||
    0
  const up =
    filteredServers.reduce(
      (total, server) =>
        formatNezhaInfo(nezhaWsData.now, server).online
          ? total + (server.state?.net_out_transfer ?? 0)
          : total,
      0,
    ) || 0
  const down =
    filteredServers.reduce(
      (total, server) =>
        formatNezhaInfo(nezhaWsData.now, server).online
          ? total + (server.state?.net_in_transfer ?? 0)
          : total,
      0,
    ) || 0

  const upSpeed =
    filteredServers.reduce(
      (total, server) =>
        formatNezhaInfo(nezhaWsData.now, server).online
          ? total + (server.state?.net_out_speed ?? 0)
          : total,
      0,
    ) || 0
  const downSpeed =
    filteredServers.reduce(
      (total, server) =>
        formatNezhaInfo(nezhaWsData.now, server).online
          ? total + (server.state?.net_in_speed ?? 0)
          : total,
      0,
    ) || 0

  filteredServers =
    status === "all"
      ? filteredServers
      : filteredServers.filter((server) =>
          [status].includes(formatNezhaInfo(nezhaWsData.now, server).online ? "online" : "offline"),
        )

  return (
    <div className="mx-auto w-full max-w-5xl px-0">
      <ServerOverview
        total={totalServers}
        online={onlineServers}
        offline={offlineServers}
        up={up}
        down={down}
        upSpeed={upSpeed}
        downSpeed={downSpeed}
      />
      <div className="flex mt-6 items-center justify-between gap-2">
        <section className="flex items-center gap-2 w-full overflow-hidden">
          <button
            onClick={() => {
              setShowMap(showMap === "0" ? "1" : "0")
            }}
            className={cn(
              "rounded-[50px] text-white cursor-pointer [text-shadow:_0_1px_0_rgb(0_0_0_/_20%)] bg-blue-600  p-[10px] transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]  ",
              {
                "shadow-[inset_0_1px_0_rgba(0,0,0,0.2)] bg-blue-500": showMap === "1",
              },
            )}
          >
            <MapIcon className="size-[13px]" />
          </button>
          <button
            onClick={() => {
              setShowServices(showServices === "0" ? "1" : "0")
              localStorage.setItem("showServices", showServices === "0" ? "1" : "0")
            }}
            className={cn(
              "rounded-[50px] text-white cursor-pointer [text-shadow:_0_1px_0_rgb(0_0_0_/_20%)] bg-blue-600  p-[10px] transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]  ",
              {
                "shadow-[inset_0_1px_0_rgba(0,0,0,0.2)] bg-blue-500": showServices === "1",
              },
            )}
          >
            <ChartBarSquareIcon className="size-[13px]" />
          </button>
          <button
            onClick={() => {
              setInline(inline === "0" ? "1" : "0")
              localStorage.setItem("inline", inline === "0" ? "1" : "0")
            }}
            className={cn(
              "rounded-[50px] text-white cursor-pointer [text-shadow:_0_1px_0_rgb(0_0_0_/_20%)] bg-blue-600  p-[10px] transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]  ",
              {
                "shadow-[inset_0_1px_0_rgba(0,0,0,0.2)] bg-blue-500": inline === "1",
              },
            )}
          >
            <ViewColumnsIcon className="size-[13px]" />
          </button>
          <GroupSwitch tabs={groupTabs} currentTab={currentGroup} setCurrentTab={setCurrentGroup} />
        </section>
        <Popover onOpenChange={setSettingsOpen}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "rounded-[50px] text-white cursor-pointer [text-shadow:_0_1px_0_rgb(0_0_0_/_20%)] bg-stone-800 p-[10px] transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]  ",
                {
                  "shadow-[inset_0_1px_0_rgba(0,0,0,0.2)] bg-stone-700": settingsOpen,
                },
              )}
            >
              <CogIcon className="size-[13px]" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="py-2 px-2 w-fit max-w-56 rounded-[8px]">
            <div className="flex flex-col gap-2">
              <section className="flex flex-col gap-1">
                <Label className=" text-stone-500  text-xs">Sort by</Label>
                <section className="flex items-center gap-1 flex-wrap">
                  <button className="rounded-[5px] text-[11px] w-fit px-1 py-0.5 cursor-pointer [text-shadow:_0_1px_0_rgb(0_0_0_/_20%)] bg-black  dark:bg-stone-600 text-white transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]  ">
                    Default
                  </button>
                  <button className="rounded-[5px] text-xs w-fit px-1 py-0.5 cursor-pointer bg-transparent border transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]  ">
                    CPU
                  </button>
                  <button className="rounded-[5px] text-xs w-fit px-1 py-0.5 cursor-pointer bg-transparent border transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]  ">
                    Mem
                  </button>
                  <button className="rounded-[5px] text-xs w-fit px-1 py-0.5 cursor-pointer bg-transparent border transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]  ">
                    Stg
                  </button>
                  <button className="rounded-[5px] text-xs w-fit px-1 py-0.5 cursor-pointer bg-transparent border transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]  ">
                    Up
                  </button>
                  <button className="rounded-[5px] text-xs w-fit px-1 py-0.5 cursor-pointer bg-transparent border transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]  ">
                    Down
                  </button>
                  <button className="rounded-[5px] text-xs w-fit px-1 py-0.5 cursor-pointer bg-transparent border transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]  ">
                    Up Total
                  </button>
                  <button className="rounded-[5px] text-xs w-fit px-1 py-0.5 cursor-pointer bg-transparent border transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]  ">
                    Down Total
                  </button>
                </section>
              </section>
              <section className="flex flex-col gap-1">
                <Label className=" text-stone-500  text-xs">Sort order</Label>
                <section className="flex items-center gap-1">
                  <button className="rounded-[5px] text-[11px] w-fit px-1 py-0.5 cursor-pointer [text-shadow:_0_1px_0_rgb(0_0_0_/_20%)] bg-black  dark:bg-stone-600 text-white transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]  ">
                    Asc
                  </button>
                  <button className="rounded-[5px] text-xs w-fit px-1 py-0.5 cursor-pointer bg-transparent border transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]  ">
                    Desc
                  </button>
                </section>
              </section>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {showMap === "1" && (
        <GlobalMap now={nezhaWsData.now} serverList={nezhaWsData?.servers || []} />
      )}
      {showServices === "1" && <ServiceTracker />}
      {inline === "1" && (
        <section className="flex flex-col gap-2 overflow-x-scroll scrollbar-hidden mt-6">
          {filteredServers.map((serverInfo) => (
            <ServerCardInline now={nezhaWsData.now} key={serverInfo.id} serverInfo={serverInfo} />
          ))}
        </section>
      )}
      {inline === "0" && (
        <section className="grid grid-cols-1 gap-2 md:grid-cols-2 mt-6">
          {filteredServers.map((serverInfo) => (
            <ServerCard now={nezhaWsData.now} key={serverInfo.id} serverInfo={serverInfo} />
          ))}
        </section>
      )}
    </div>
  )
}
