import managerdash from "./managerdash.js"
import customerdash from "./customerdash.js"
import admindash from "./admindash.js"

export default {
    template: `<div>
        <customerdash v-if="userRole === 'customer'"></customerdash>
        <managerdash v-if="userRole === 'manager'"></managerdash>
        <admindash v-if="userRole === 'admin'"></admindash>
    </div>`,

    data() {
        return {
            userRole: localStorage.getItem('role'),
        }
    },
    components: {  // Corrected property name
        managerdash,
        customerdash,
        admindash,
    }
}
