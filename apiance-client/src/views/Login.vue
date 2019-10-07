<template>
  <md-content id="bg-1" :class="{ 'md-error': error }">
    <md-content class="md-gutter md-layout md-alignment-center">
      <img src="@/assets/logos/logo.png" alt="apiance" width="160px" />
    </md-content>

    <md-content class="md-gutter md-layout md-alignment-center">
      
      <form @submit.prevent="validateLogin" class="login-card">
        <div id="owl-login" :class="{ 'focused': focused }">
          <div class="eyes"></div>
          <div class="arm-up-right"></div>
          <div class="arm-up-left"></div>
          <div class="arm-down-left"></div>
          <div class="arm-down-right"></div>
        </div>
        <md-card>


          <md-card-content>
            <div class="top-40 md-layout-item md-small-size-100">
              <md-field :class="getValidationClass('email')">
                <label for="first-name">First Name</label>
                <md-input name="email" id="email" autocomplete v-model="form.email" />
                <span class="md-error" v-if="!$v.form.email.required">The email is required</span>
                <span class="md-error" v-else-if="!$v.form.email.email">Email is not correct</span>
              </md-field>

              <md-field :class="getValidationClass('password')" >
                <label for="first-name">Password</label>
                <md-input name="password" id="password" type="password" v-model="form.password" @focus="focused = true" @blur="focused = false"/>
                <span class="md-error" v-if="!$v.form.password.required">The password is required</span>
              </md-field>
            </div>
          </md-card-content>

          <md-card-actions>
            <md-button type="submit" class="md-primary">Login</md-button>
          </md-card-actions>

          
        </md-card>
        
      </form>

      <img src="@/assets/images/bg/api.png" alt="apiance" width="800px" class="bgBottom" />

      <!--
    <b-row class="h-100">
      <b-colxx xxs="12" md="10" class="mx-auto my-auto">
        <b-card class="auth-card" no-body>
          <div class="position-relative image-side">
            <p class="text-white h2">{{ $t('pages.magic-is-in-the-details') }}</p>
            <p class="white mb-0">
              Please use your credentials to login.
              <br />If you are not a member, please
              <router-link tag="a" to="/user/register" class="white">register</router-link>.
            </p>
          </div>
          <div class="form-side">
            <router-link tag="a" to="/">
              <span class="logo-single" />
            </router-link>
            <h6 class="mb-4">{{ $t('user.login-title')}}</h6>
            <b-form @submit.prevent="formSubmit">
              <label class="form-group has-float-label mb-4">
                <input type="email" class="form-control" v-model="email" />
                <span>{{ $t('user.email') }}</span>
              </label>
              <label class="form-group has-float-label mb-4">
                <input type="password" class="form-control" v-model="password" />
                <span>{{ $t('user.password') }}</span>
              </label>
              <div class="d-flex justify-content-between align-items-center">
                <router-link
                  tag="a"
                  to="/user/forgot-password"
                >{{ $t('user.forgot-password-question')}}</router-link>
                <b-button
                  type="submit"
                  variant="primary"
                  size="lg"
                  class="btn-shadow"
                  :disabled="processing"
                >{{ $t('user.login-button')}}</b-button>
              </div>
            </b-form>
          </div>
        </b-card>
      </b-colxx>
    </b-row>

      -->
    </md-content>
  </md-content>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import { validationMixin } from 'vuelidate'
import { required, email } from 'vuelidate/lib/validators'

export default {
  mixins: [validationMixin],
  data: () => ({
    form: {
      email: 'ben@gmail.com',
      password: 'test'
    },
    userSaved: false,
    focused: false
  }),
  validations: {
    form: {
      email: {
        required,
        email
      },
      password: {
        required
      }
    }
  },
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
    getValidationClass(fieldName) {
      const field = this.$v.form[fieldName]

      if (field) {
        return {
          'md-invalid': field.$invalid && field.$dirty
        }
      }
    },
    validateLogin() {
      this.$v.$touch()

      if (!this.$v.$invalid) {
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
.login-card {
  position: absolute;
  left: 50%;
  top: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  width: 500px;
  z-index: 1;
}
img {
  margin: 10px;
}
.top-40{
  margin-top: 40px;
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
  transform: translateX(57px) scale(.8);
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
  transform: translateX(-34px) scale(.8);
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
#owl-login.focused .arm-up-left, #owl-login.focused .arm-up-right {
  opacity: 1;
  transform: scale(1);
  background-position: 0 0;
}
#owl-login.focused .arm-up-left, #owl-login.focused .arm-up-right {
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
.md-content.md-theme-default{
  background-color: transparent;
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
.login-card .md-card.md-theme-default{
  background: transparent;
}
.bgBottom{
  position: absolute;
  right: 0;
  bottom: 0
}
</style>
