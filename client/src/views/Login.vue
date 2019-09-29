<template>
  <md-content>
    <md-content class="md-gutter md-layout md-alignment-center">
      <img src="@/assets/logos/logo.png" alt="apiance" width="200px" />
    </md-content>

    <md-content class="md-gutter md-layout md-alignment-center">
      <form @submit.prevent="validateLogin" class="login-card">
        <md-card>
          <md-card-header>
            <md-card-header-text>
              <div class="md-title md-layout md-gutter md-alignment-center">Please Login</div>
            </md-card-header-text>
          </md-card-header>

          <md-card-content>
            <div class="md-layout-item md-small-size-100">
              <md-field :class="getValidationClass('email')">
                <label for="first-name">First Name</label>
                <md-input name="email" id="email" autocomplete v-model="form.email" />
                <span class="md-error" v-if="!$v.form.email.required">The email is required</span>
                <span class="md-error" v-else-if="!$v.form.email.email">Email is not correct</span>
              </md-field>

              <md-field :class="getValidationClass('password')">
                <label for="first-name">Password</label>
                <md-input name="password" id="password" type="password" v-model="form.password" />
                <span class="md-error" v-if="!$v.form.password.required">The password is required</span>
              </md-field>
            </div>
          </md-card-content>

          <md-card-actions>
            <md-button type="submit" class="md-primary">Login</md-button>
          </md-card-actions>
        </md-card>
      </form>

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
    userSaved: false
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
  width: 600px;
}

img {
  width: 300px;
  margin: 10px;
}
</style>
