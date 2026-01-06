import { useEffect, useRef } from 'react'
import { Button, Typography, Space, Divider } from 'antd'
import L from 'leaflet'
import { RailwayProject, Station } from '../../../mock/railway-data'
import 'leaflet/dist/leaflet.css'

const { Text } = Typography

// 修复 Leaflet 默认图标问题
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface StationMapProps {
  project: RailwayProject
  selectedStation: Station | null
  showPopup: boolean
  onStationClick: (station: Station) => void
  onPopupClose: () => void
  onEnterSystem: (station: Station) => void
}

const StationMap = ({
  project,
  selectedStation,
  showPopup,
  onStationClick,
  onPopupClose,
  onEnterSystem
}: StationMapProps) => {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<L.Marker[]>([])

  useEffect(() => {
    if (!mapContainerRef.current) return

    // 初始化地图
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [project.center.lat, project.center.lng],
        zoom: project.zoom,
        zoomControl: true,
      })

      // 添加地图图层
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current)
    }

    // 清除旧的标记
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // 添加站点标记
    project.stations.forEach(station => {
      if (!mapRef.current) return

      // 创建自定义图标
      const iconColor = station.status === 'warning' ? '#F59E0B' : '#10B981'
      const icon = L.divIcon({
        className: 'custom-station-marker',
        html: `
          <div style="
            width: 32px; 
            height: 32px; 
            background: ${iconColor}; 
            border-radius: 50%; 
            border: 2px solid #fff; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 16px;
          ">
            ${station.status === 'warning' ? '⚠' : '✓'}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      })

      const marker = L.marker([station.lat, station.lng], { icon })
        .addTo(mapRef.current)

      // 创建弹窗内容
      const popupContent = `
        <div style="padding: 8px; min-width: 200px;">
          <div style="font-weight: 600; font-size: 14px; color: #1E293B; margin-bottom: 8px;">
            ${station.name}
          </div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            <div style="
              width: 8px; 
              height: 8px; 
              border-radius: 50%; 
              background: ${station.status === 'warning' ? '#E17100' : '#009966'};
            "></div>
            <span style="font-size: 12px; color: #64748B;">
              ${station.status === 'normal' ? '正常' : '告警'}
            </span>
            <span style="font-size: 12px; color: #64748B; margin-left: 8px; border-left: 1px solid #CBD5E1; padding-left: 8px;">
              ${station.energy.toLocaleString()} kWh
            </span>
          </div>
          <button 
            id="enter-btn-${station.id}"
            style="
              width: 100%;
              padding: 8px 16px;
              background: linear-gradient(90deg, #3B82F6 0%, #6366F1 100%);
              border: none;
              border-radius: 8px;
              color: #fff;
              font-size: 14px;
              cursor: pointer;
              font-weight: 500;
            "
          >
            进入监控系统
          </button>
        </div>
      `

      marker.bindPopup(popupContent)

      // 标记点击事件
      marker.on('click', () => {
        onStationClick(station)
        // 延迟绑定按钮事件，等待DOM渲染
        setTimeout(() => {
          const btn = document.getElementById(`enter-btn-${station.id}`)
          if (btn) {
            btn.onclick = (e) => {
              e.preventDefault()
              e.stopPropagation()
              onEnterSystem(station)
            }
          }
        }, 100)
      })

      markersRef.current.push(marker)
    })

    // 更新地图视图
    mapRef.current.setView([project.center.lat, project.center.lng], project.zoom, {
      animate: true,
      duration: 1.5
    })

    return () => {
      // 清理函数 - 不销毁地图实例，只是清理
    }
  }, [project, onStationClick, onEnterSystem])

  // 清理地图实例
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  return (
    <div 
      ref={mapContainerRef}
      className="map-container"
      style={{ 
        height: '100%', 
        width: '100%', 
        borderRadius: '16px',
        overflow: 'hidden'
      }}
    />
  )
}

export default StationMap
