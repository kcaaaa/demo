<template>
  <div class="login-wrapper">
    <el-card class="login-card" shadow="hover">
      <div class="login-header">
        <div class="title">
          <i class="fa fa-leaf"></i>
          <div>
            <div class="name">高铁站节能降耗演示系统</div>
            <div class="desc">角色登录 · 权限分配 · 演示数据</div>
          </div>
        </div>
      </div>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="0" size="large">
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            @keyup.enter.native="handleSubmit"
          >
            <template #prefix>
              <i class="fa fa-user"></i>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            placeholder="请输入密码"
            show-password
            @keyup.enter.native="handleSubmit"
          >
            <template #prefix>
              <i class="fa fa-lock"></i>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="full-btn" :loading="submitting" @click="handleSubmit">
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="helper">
        <div class="helper-title">
          <i class="fa fa-info-circle"></i> 演示账号
        </div>
        <div class="helper-grid">
          <div class="helper-item">
            <div class="label">管理员</div>
            <div class="value">admin / 123456</div>
            <div class="desc">访问全部模块</div>
          </div>
          <div class="helper-item">
            <div class="label">单站演示</div>
            <div class="value">danz / 123456</div>
            <div class="desc">首页、单站、预警、策略</div>
          </div>
          <div class="helper-item">
            <div class="label">多站演示</div>
            <div class="value">duoz / 123456</div>
            <div class="desc">首页、多站、占比、预警、策略、设备</div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login, getHomePath } from '../../utils/auth'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const formRef = ref(null)
    const submitting = ref(false)
    const form = ref({
      username: '',
      password: ''
    })

    const rules = {
      username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
      password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
    }

    const handleSubmit = () => {
      if (!formRef.value) return
      formRef.value.validate((valid) => {
        if (!valid) return
        submitting.value = true
        setTimeout(() => {
          const user = login(form.value.username.trim(), form.value.password.trim())
          if (!user) {
            ElMessage.error('账号或密码错误')
            submitting.value = false
            return
          }
          ElMessage.success(`欢迎 ${user.displayName}`)
          const redirect = route.query.redirect || getHomePath(user.role)
          router.replace(redirect)
          submitting.value = false
        }, 300)
      })
    }

    return {
      form,
      rules,
      formRef,
      submitting,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.login-wrapper {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f5ff 0%, #f5f7fa 100%);
  padding: 20px;
}

.login-card {
  width: 420px;
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
}

.login-header {
  margin-bottom: 20px;
}

.title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title i {
  color: #409EFF;
  font-size: 28px;
}

.name {
  font-size: 18px;
  font-weight: 700;
  color: #1d2129;
}

.desc {
  font-size: 12px;
  color: #86909c;
}

.full-btn {
  width: 100%;
}

.helper {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #e5e6eb;
}

.helper-title {
  font-size: 13px;
  color: #4e5969;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.helper-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 8px;
}

.helper-item {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 10px 12px;
  border: 1px solid #ebeef5;
}

.helper-item .label {
  font-weight: 600;
  color: #303133;
}

.helper-item .value {
  color: #409EFF;
  font-size: 13px;
  margin: 4px 0;
}

.helper-item .desc {
  color: #86909c;
  font-size: 12px;
}

@media (min-width: 768px) {
  .helper-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>

