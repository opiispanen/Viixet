<template>
<page>
    <div class="row">
        <div class="col-xs-12 col-sm-6 col-sm-offset-3">
            <h1>{{ $translate('PASSWORD_RESET_TITLE') }}</h1>
        </div>
        <div class="col-xs-12 col-sm-6 col-sm-offset-3">
            <form-input :label="$translate('PASSWORD')">
                <input type="password" v-model="password">
            </form-input>
        </div>
        <div class="col-xs-12 col-sm-6 col-sm-offset-3">
            <form-input :label="$translate('PASSWORD_REPEAT')">
                <input type="password" v-model="passwordRepeat">
            </form-input>
        </div>
        <div class="col-xs-12 col-sm-6 col-sm-offset-3">
            <button class="button button-success button-thick button-wide" 
                :disabled="!passwordsMatch"
                @click="send">
                <span>{{ $translate('SAVE') }}</span>
            </button>
        </div>
    </div>
</page>
</template>

<script>
import axios from 'axios'

export default {
    data: () => ({
        token: null,
        password: '',
        passwordRepeat: ''
    }),
    computed: {
        validPassword() {
            return this.password.trim().length > 0;
        },
        passwordsMatch() {
            return this.validPassword && this.password === this.passwordRepeat;
        }
    },
    methods: {
        send() {
            const data = {
                password: this.password
            }
            axios.post('/resetpassword/'+this.$route.params.token, data)
                .then(({ data }) => {
                    this.viixetAlert({
                        message: this.$translate(data.success ? 'PASSWORD_CHANGE_SUCCESS' : 'PASSWORD_CHANGE_FAILURE'),
                        buttons: [
                            {
                                text: this.$translate('OK'),
                                type: 'default',
                                callback: 'confirm'
                            }
                        ]
                    }).then(() => {
                        if (data.success) {
                            this.$router.push({ path: '/' })
                        }
                    })
                })
                .catch((error) => {
                    this.viixetAlert({
                        message: this.$translate('PASSWORD_CHANGE_FAILURE'),
                        buttons: [
                            {
                                text: this.$translate('OK'),
                                type: 'default',
                                callback: 'confirm'
                            }
                        ]
                    })
                })
        },
        init() {
            
        }
    },
    watch: {
        token: {
            '$route.params.token': {
            deep: true,
            immediate: true,
            handler(id) {
                this.$nextTick(() => this.init())
            }
        }
        }
    }
}
</script>