import React, { useState } from 'react'
import {
  Card,
  Col,
  Row,
  Select,
  Space,
  Tag,
  Button,
  Slider,
  Collapse,
  Typography,
  message,
  InputNumber,
  Table,
  Progress,
} from 'antd'
import {
  ThunderboltOutlined,
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  BarChartOutlined,
  HistoryOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import PageHeader from '../../components/PageHeader'
import { sleep } from '../../utils/mock'

const Strategy = () => {
  const [stationType, setStationType] = useState('large')
  const [savingsGoal, setSavingsGoal] = useState('medium')
  const [budget, setBudget] = useState(200)
  const [loading, setLoading] = useState(false)

  const [strategies] = useState([
    {
      id: 'rec-001',
      name: 'LED 照明改造',
      savingsRate: 5.2,
      investment: 120,
      paybackPeriod: 2.5,
      matchScore: 92,
      desc: '将传统照明替换为LED照明，节能效果显著',
      category: '照明',
    },
    {
      id: 'rec-002',
      name: '空调系统优化',
      savingsRate: 7.5,
      investment: 180,
      paybackPeriod: 3.1,
      matchScore: 88,
      desc: '优化空调运行策略，根据客流动态调节',
      category: '空调',
    },
    {
      id: 'rec-003',
      name: '智能照明控制',
      savingsRate: 3.8,
      investment: 80,
      paybackPeriod: 2.0,
      matchScore: 85,
      desc: '安装光感应和人体感应装置，智能控制照明',
      category: '照明',
    },
    {
      id: 'rec-004',
      name: '变频改造',
      savingsRate: 6.5,
      investment: 150,
      paybackPeriod: 2.8,
      matchScore: 82,
      desc: '对水泵、风机等设备进行变频改造',
      category: '动力',
    },
  ])

  const [combination, setCombination] = useState<any[]>([])

  const handleGetRecommendations = async () => {
    setLoading(true)
    await sleep(800)
    message.success('已获取推荐策略')
    setLoading(false)
  }

  const handleReset = () => {
    setStationType('large')
    setSavingsGoal('medium')
    setBudget(200)
    message.info('已重置筛选条件')
  }

  const handleAddToCombination = (strategy: any) => {
    if (combination.find((s) => s.id === strategy.id)) {
      message.warning('该策略已在组合中')
      return
    }
    setCombination([...combination, strategy])
    message.success('已加入策略组合')
  }

  const handleRemoveFromCombination = (id: string) => {
    setCombination(combination.filter((s) => s.id !== id))
    message.success('已移除策略')
  }

  const handleClearCombination = () => {
    setCombination([])
    message.success('已清空策略组合')
  }

  // 执行模拟
  const handleRunSimulation = async () => {
    if (combination.length === 0) {
      message.warning('请先添加策略到组合中')
      return
    }
    setLoading(true)
    await sleep(1500)
    message.success(`模拟完成！预计节能率：${combinationStats.totalSavingsRate}%，总投资：${combinationStats.totalInvestment}万元`)
    setLoading(false)
  }

  // 应用模板
  const handleApplyTemplate = async (template: any) => {
    setLoading(true)
    await sleep(600)
    const templateStrategies = strategies.filter(s => template.strategies.includes(s.name))
    setCombination(templateStrategies)
    message.success(`已应用模板：${template.name}`)
    setLoading(false)
  }

  const combinationStats = {
    totalSavingsRate: combination.reduce((sum, s) => sum + s.savingsRate, 0).toFixed(1),
    totalInvestment: combination.reduce((sum, s) => sum + s.investment, 0),
    avgPaybackPeriod: combination.length
      ? (combination.reduce((sum, s) => sum + s.paybackPeriod, 0) / combination.length).toFixed(1)
      : '-',
  }

  const templates = [
    { 
      id: 'tpl-001', 
      name: '基础节能方案', 
      strategies: ['LED 照明改造', '智能照明控制'], 
      score: 85,
      desc: '适合中小型站点，投资小、见效快',
      investment: 200,
      savingsRate: 9.0,
    },
    { 
      id: 'tpl-002', 
      name: '综合改造方案', 
      strategies: ['LED 照明改造', '空调系统优化', '变频改造'], 
      score: 92,
      desc: '适合大型站点全面改造，节能效果显著',
      investment: 450,
      savingsRate: 19.2,
    },
    { 
      id: 'tpl-003', 
      name: '快速回本方案', 
      strategies: ['智能照明控制'], 
      score: 78,
      desc: '快速回收投资，低风险选择',
      investment: 80,
      savingsRate: 3.8,
    },
  ]

  const historyRecords = [
    {
      key: 1,
      time: '2024-01-15 14:30',
      name: '综合节能模拟',
      station: '北京站',
      savingsRate: 12.5,
      status: '已完成',
    },
    {
      key: 2,
      time: '2024-01-14 10:20',
      name: '照明改造模拟',
      station: '上海站',
      savingsRate: 5.8,
      status: '已完成',
    },
  ]

  return (
    <div>
      <PageHeader
        title="节能策略模拟"
        subtitle="智能推荐 · 模板管理 · 策略组合 · 实时模拟 · 历史记录"
        items={[{ title: '首页', path: '/' }, { title: '节能策略模拟' }]}
      />

      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <div style={{ marginBottom: 8, fontWeight: 600, color: 'var(--text-color)' }}>车站类型</div>
            <Select value={stationType} onChange={setStationType} style={{ width: '100%' }}>
              <Select.Option value="large">大型站</Select.Option>
              <Select.Option value="medium">中型站</Select.Option>
              <Select.Option value="small">小型站</Select.Option>
            </Select>
          </Col>

          <Col xs={24} md={6}>
            <div style={{ marginBottom: 8, fontWeight: 600, color: 'var(--text-color)' }}>节能目标</div>
            <Select value={savingsGoal} onChange={setSavingsGoal} style={{ width: '100%' }}>
              <Select.Option value="low">低(5%-10%)</Select.Option>
              <Select.Option value="medium">中(10%-15%)</Select.Option>
              <Select.Option value="high">高(15%+)</Select.Option>
            </Select>
          </Col>

          <Col xs={24} md={6}>
            <div style={{ marginBottom: 8, fontWeight: 600, color: 'var(--text-color)' }}>预算上限(万元)</div>
            <InputNumber min={0} max={1000} value={budget} onChange={(v) => setBudget(v || 0)} style={{ width: '100%' }} />
          </Col>

          <Col xs={24} md={6}>
            <div style={{ marginBottom: 8, opacity: 0 }}>-</div>
            <Space>
              <Button type="primary" icon={<ThunderboltOutlined />} onClick={handleGetRecommendations} loading={loading}>
                获取推荐
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* @ts-ignore */}
      <Collapse
        defaultActiveKey={['recommendations', 'templates', 'combination']}
        style={{ marginBottom: 16 }}
        items={[
          {
            key: 'recommendations',
            label: '策略推荐',
            children: (
              <Row gutter={[16, 16]}>
                {strategies
                  .filter((s) => s.investment <= budget)
                  .map((s) => (
                    <Col xs={24} md={12} key={s.id}>
                      <Card
                        title={
                          <Space>
                            {s.name}
                            <Tag color="blue">匹配度 {s.matchScore}%</Tag>
                            <Tag color="cyan">{s.category}</Tag>
                          </Space>
                        }
                        extra={
                          <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => handleAddToCombination(s)}
                          >
                            加入组合
                          </Button>
                        }
                      >
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div>{s.desc}</div>
                          <div>
                            <Space wrap>
                              <Tag color="green">节能率 {s.savingsRate}%</Tag>
                              <Tag color="orange">投资 ¥{s.investment}万</Tag>
                              <Tag color="purple">回收期 {s.paybackPeriod} 年</Tag>
                            </Space>
                          </div>
                          <div style={{ marginTop: 8 }}>
                            <div style={{ fontSize: 12, color: 'var(--text-color-secondary)', marginBottom: 4 }}>
                              匹配度
                            </div>
                            <Progress percent={s.matchScore} strokeColor="#1890ff" />
                          </div>
                        </Space>
                      </Card>
                    </Col>
                  ))}
              </Row>
            ),
          },
          {
            key: 'templates',
            label: '策略模板',
            children: (
              <Row gutter={[16, 16]}>
                {templates.map((tpl) => (
                  <Col xs={24} md={8} key={tpl.id}>
                    <Card
                      title={tpl.name}
                      extra={<Tag color="blue">评分 {tpl.score}</Tag>}
                      actions={[
                        <Button
                          key="apply"
                          type="link"
                          onClick={() => {
                            const selectedStrategies = strategies.filter((s) =>
                              tpl.strategies.includes(s.name)
                            )
                            setCombination(selectedStrategies)
                            message.success(`已应用模板：${tpl.name}`)
                          }}
                        >
                          应用模板
                        </Button>,
                        <Button key="view" type="link" onClick={() => message.info(`查看详情：${tpl.name}`)}>
                          查看详情
                        </Button>,
                      ]}
                    >
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--text-color-secondary)', marginBottom: 8 }}>
                          包含策略：
                        </div>
                        {tpl.strategies.map((name, idx) => (
                          <Tag key={idx} style={{ marginBottom: 4 }}>
                            {name}
                          </Tag>
                        ))}
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            ),
          },
          {
            key: 'combination',
            label: (
              <Space>
                策略组合
                <Tag color="blue">{combination.length} 个策略</Tag>
              </Space>
            ),
            extra: combination.length > 0 && (
              <Button
                type="link"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation()
                  handleClearCombination()
                }}
              >
                清空组合
              </Button>
            ),
            children: (
              <>
                {combination.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-color-secondary)' }}>
                    暂无策略，请从推荐列表或模板中添加
                  </div>
                ) : (
                  <>
                    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                      <Col xs={24} sm={8}>
                        <Card>
                          <div style={{ fontSize: 14, color: 'var(--text-color-secondary)', marginBottom: 8 }}>
                            总节能率
                          </div>
                          <div style={{ fontSize: 28, fontWeight: 700, color: '#52c41a' }}>
                            {combinationStats.totalSavingsRate}%
                          </div>
                        </Card>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Card>
                          <div style={{ fontSize: 14, color: 'var(--text-color-secondary)', marginBottom: 8 }}>
                            总投资
                          </div>
                          <div style={{ fontSize: 28, fontWeight: 700, color: '#1890ff' }}>
                            ¥{combinationStats.totalInvestment}万
                          </div>
                        </Card>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Card>
                          <div style={{ fontSize: 14, color: 'var(--text-color-secondary)', marginBottom: 8 }}>
                            平均回收期
                          </div>
                          <div style={{ fontSize: 28, fontWeight: 700, color: '#722ed1' }}>
                            {combinationStats.avgPaybackPeriod}年
                          </div>
                        </Card>
                      </Col>
                    </Row>

                    <Table
                      rowKey="id"
                      dataSource={combination}
                      columns={[
                        { title: '策略名称', dataIndex: 'name', key: 'name' },
                        { title: '节能率(%)', dataIndex: 'savingsRate', key: 'savingsRate', width: 120 },
                        { title: '投资(万元)', dataIndex: 'investment', key: 'investment', width: 120 },
                        { title: '回收期(年)', dataIndex: 'paybackPeriod', key: 'paybackPeriod', width: 120 },
                        {
                          title: '操作',
                          key: 'action',
                          width: 100,
                          render: (_: any, record: any) => (
                            <Button
                              type="link"
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                              onClick={() => handleRemoveFromCombination(record.id)}
                            >
                              移除
                            </Button>
                          ),
                        },
                      ]}
                      pagination={false}
                    />

                    <div style={{ marginTop: 16, textAlign: 'center' }}>
                      <Space>
                        <Button
                          type="primary"
                          size="large"
                          icon={<BarChartOutlined />}
                          onClick={async () => {
                            setLoading(true)
                            await sleep(1000)
                            message.success('模拟完成！预计节能率：' + combinationStats.totalSavingsRate + '%')
                            setLoading(false)
                          }}
                          loading={loading}
                        >
                          开始实时模拟
                        </Button>
                        <Button
                          size="large"
                          onClick={() => message.info('保存策略组合（示例）')}
                        >
                          保存组合
                        </Button>
                      </Space>
                    </div>
                  </>
                )}
              </>
            ),
          },
          {
            key: 'history',
            label: <Space>历史记录 <Tag color="blue">{historyRecords.length}</Tag></Space>,
            children: (
              <Table
                rowKey="key"
                dataSource={historyRecords}
                columns={[
                  { title: '时间', dataIndex: 'time', key: 'time', width: 180 },
                  { title: '模拟名称', dataIndex: 'name', key: 'name' },
                  { title: '站点', dataIndex: 'station', key: 'station', width: 120 },
                  { title: '节能率(%)', dataIndex: 'savingsRate', key: 'savingsRate', width: 120 },
                  {
                    title: '状态',
                    dataIndex: 'status',
                    key: 'status',
                    width: 100,
                    render: (v: string) => <Tag color="green">{v}</Tag>,
                  },
                  {
                    title: '操作',
                    key: 'action',
                    width: 150,
                    render: () => (
                      <Space size="small">
                        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => message.info('查看详情（示例）')}>
                          详情
                        </Button>
                        <Button type="link" size="small" icon={<HistoryOutlined />} onClick={() => message.info('重新模拟（示例）')}>
                          重新模拟
                        </Button>
                      </Space>
                    ),
                  },
                ]}
                pagination={{ pageSize: 5, showTotal: (total) => `共 ${total} 条` }}
              />
            ),
          },
        ]}
      />
    </div>
  )
}

export default Strategy
