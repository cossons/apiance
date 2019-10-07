<template>
  <v-content id="bg-1">
    <v-container class="d-flex justify-center">
      <img src="@/assets/logos/logo.png" alt="apiance" class="sized-logo" />
    </v-container>

    <v-content>
      <v-form @submit.prevent="validateLogin" class="login-card pa-5">
        <div id="owl-login" :class="{ 'focused': focused }">
          <div class="eyes"></div>
          <div class="arm-up-right"></div>
          <div class="arm-up-left"></div>
          <div class="arm-down-left"></div>
          <div class="arm-down-right"></div>
        </div>
        <v-card>
          <v-card-text>
            <v-text-field
              v-model="form.email"
              :rules="[rules.required]"
              label="Login"
              outlined
              required
            ></v-text-field>

            <v-text-field
              v-model="form.password"
              :append-icon="showPassword ? 'visibility' : 'visibility_off'"
              :rules="[rules.required]"
              :type="showPassword ? 'text' : 'password'"
              label="Password"
              @click:append="showPassword = !showPassword"
              @focus="focused = true"
              @blur="focused = false"
              outlined
            ></v-text-field>
          </v-card-text>

          <v-card-actions class="d-flex justify-center">
            <v-btn type="submit" color="primary">Login</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>

      <img src="@/assets/images/bg/api.png" alt="apiance" width="800px" class="bgBottom" />
    </v-content>
  </v-content>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  data: () => ({
    showPassword: false,
    rules: {
      required: value => !!value || 'Required.'
    },

    form: {
      email: '',
      password: ''
    },
    userSaved: false,
    focused: false
  }),
  computed: {
    ...mapGetters(['currentUser', 'processing', 'loginError'])
  },
  methods: {
    ...mapActions(['login']),
    sendLogin() {
      this.email = this.form.email
      this.password = this.form.password
      this.login({ email: this.email, password: this.password })
    },
    validateLogin() {
      if (this.form.email.length > 0 && this.form.password.length > 0) {
        this.sendLogin()
      }
    }
  },
  watch: {
    currentUser(val) {
      if (val && val.uid && val.uid.length > 0) {
        setTimeout(() => {
          this.$router.push('/')
        }, 500)
      }
    },
    loginError(val) {
      if (val != null) {
        this.$notify('error', 'Login Error', val, { duration: 3000, permanent: false })
      }
    }
  }
}
</script>

<style scoped>
.sized-logo {
  width: 200px;
}
.login-card {
  position: absolute;
  left: 50%;
  -webkit-transform: translate(-50%, -30%);
  transform: translate(-50%, 30%);
  width: 500px;
  z-index: 1;
}
#owl-login {
  width: 116px;
  height: 92px;
  background: url(../assets/images/face.png);
  position: absolute;
  top: -82px;
  left: 50%;
  margin-left: -58px;
}
#owl-login .eyes {
  width: 100%;
  height: 100%;
  background: url(../assets/images/eyes.png);
  opacity: 0;
  transition: 0.1s ease-out 0s;
}
#owl-login .arm-up-right {
  width: 51px;
  height: 41px;
  position: absolute;
  bottom: 11px;
  right: 5px;
  transform: translateX(57px) scale(0.8);
  transform-origin: 0 40px;
  transition: background-position 0.3s ease-in-out, transform 0.3s ease-in-out, opacity 0.3s linear;
  background: url(../assets/images/arm-up-right.png) no-repeat 0 25px;
  opacity: 0;
}
#owl-login .arm-up-left {
  width: 52px;
  height: 41px;
  position: absolute;
  bottom: 11px;
  left: -3px;
  transform: translateX(-34px) scale(0.8);
  transform-origin: 0 40px;
  transition: background-position 0.3s ease-in-out, transform 0.3s ease-in-out, opacity 0.3s linear;
  background: url(../assets/images/arm-up-left.png) no-repeat 0 25px;
  opacity: 0;
}
#owl-login .arm-down-left {
  width: 43px;
  height: 25px;
  background: url(../assets/images/arm-down-left.png);
  position: absolute;
  bottom: 2px;
  left: -34px;
  transition: 0.3s ease-out;
}
#owl-login .arm-down-right {
  width: 43px;
  height: 26px;
  background: url(../assets/images/arm-down-right.png);
  position: absolute;
  bottom: 1px;
  right: -40px;
  transition: all 0.3s ease-in-out;
}
#owl-login.focused .arm-up-left,
#owl-login.focused .arm-up-right {
  opacity: 1;
  transform: scale(1);
  background-position: 0 0;
}
#owl-login.focused .arm-up-left,
#owl-login.focused .arm-up-right {
  opacity: 1;
  transform: scale(1);
  background-position: 0 0;
}
#owl-login.focused .arm-down-left {
  opacity: 0;
  transform: translateX(10px) scale(0) translateY(-10px);
}
#owl-login.focused .arm-down-right {
  opacity: 0;
  transform: translateX(12px) scale(0) translateY(-8px);
}
#bg-1 {
  background-image: url(../assets/images/bg/1.png);
  background-color: #fff;
  background-position: center center;
  background-repeat: no-repeat;
  background-attachment: scroll;
  background-size: cover;
  overflow: hidden;
  min-height: 100%;
  height: 100vh;
  width: 100vw;
}
.bgBottom {
  position: absolute;
  right: 0;
  -webkit-transform: translate(-0%, -100%);
  transform: translate(-0%, 50%);
}
</style>
