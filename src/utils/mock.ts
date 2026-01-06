import { message } from 'antd'

export const sleep = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

export const fakeRequest = async <T>(data: T, ms = 500): Promise<T> => {
  await sleep(ms)
  return data
}

export const exportCsv = (rows: (string | number)[][], filename: string) => {
  const csv = rows.map((r) => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  message.success('已导出 CSV')
}

