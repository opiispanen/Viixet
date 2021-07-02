<template>
<div>
    <div v-if="enabled">
        <p>{{ usedSpace }}/{{ quota }} MB</p>
        <label>File
            <input type="file" @change="submitFiles" ref="files" multiple :accept="accept.join(',')" />
        </label>
        <button v-if="false" v-on:click="submitFiles()">{{ $translate('SUBMIT') }}</button>
    </div>
    <div v-else>
        <p v-if="requested"><span class="badge badge-big">{{ $translate('FILE_PENDING_PRIVILEGES') }}</span></p>
        <p v-else>
            <button class="button button-thick" @click="$store.dispatch('files/requestPrivileges')">{{ $translate('FILE_REQUEST_PRIVILEGES') }}</button>
        </p>
    </div>
</div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
    computed: {
        ...mapGetters({
            usedSpace: 'files/usedSpace',
            quota: 'files/quota',
            accept: 'files/mimetypes',
            requested: 'files/requested',
            enabled: 'files/enabled'
        })
    },
    methods: {
        submitFiles(){
            const files = this.$refs.files.files;
            
            this.$store.dispatch('files/upload', files)
                .then((data) => this.$emit('onLoad', data))
                .catch((error) => {
                    this.viixetAlert({
                        message: this.$translate('FILES_UPLOAD_FAILED'),
                        subMessage: this.$translate(error),
                        buttons: [
                            {
                                text: this.$translate('CONFIRM'),
                                type: 'bare',
                                callback: 'cancel'
                            }
                        ]
                    })
                }).finally(() => {
                    this.$refs.files.value = '';
                })
        }
    }
}
</script>