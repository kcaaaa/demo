import { Card, Col, Row, Statistic, Tag } from 'antd'
import PageHeader from '../../components/PageHeader'
import Chart from '../../components/Chart'

const OverviewPage = () => {
  const resourceOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['CPU', '内存'] },
    xAxis: { type: 'category', data: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'] },
    yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
    series: [
      { name: 'CPU', type: 'line', data: [32, 28, 35, 45, 55, 48, 38, 35], smooth: true },
      { name: '内存', type: 'line', data: [42, 38, 45, 52, 58, 55, 48, 45], smooth: true },
    ],
  }

  return (
    <div>
      <PageHeader title="系统概览" subtitle="版本、资源使用、趋势" />
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="版本" value="v1.0.0" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="CPU 使用率" value={45} suffix="%" />
            <Tag color="blue" style={{ marginTop: 8 }}>
              稳定
            </Tag>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="内存使用率" value={52} suffix="%" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="磁盘使用率" value={38} suffix="%" />
          </Card>
        </Col>
      </Row>

      <Card title="资源使用趋势" style={{ marginTop: 16 }}>
        <Chart option={resourceOption} height={300} />
      </Card>
    </div>
  )
}

export default OverviewPage

