<template>
    <div class="app-datatable">
        <slot name="header"></slot>

        <DataTable
            :value="data"
            :paginator="paginator"
            :rows="rows"
            :rowsPerPageOptions="rowsPerPageOptions"
            :loading="loading"
            :dataKey="dataKey"
            :selection="modelValue"
            @update:selection="$emit('update:modelValue', $event)"
            :filters="filters"
            :globalFilterFields="globalFilterFields"
            :sortField="sortField"
            :sortOrder="sortOrder"
            :lazy="lazy"
            :totalRecords="totalRecords"
            :first="first"
            :rowClass="rowClass"
            v-model:expandedRows="expandedRows"
            :exportFilename="exportFilename"
            :stripedRows="stripedRows"
            :showGridlines="showGridlines"
            :size="size"
            :responsiveLayout="responsiveLayout"
            @page="onPage"
            @sort="onSort"
            @filter="onFilter"
            @row-select="onRowSelect"
            @row-unselect="onRowUnselect"
            @row-expand="onRowExpand"
            @row-collapse="onRowCollapse"
            ref="dataTableRef"
        >
            <!-- Generate columns from the columns prop -->
            <Column
                v-for="(col, i) in columns"
                :key="i"
                :field="col.field"
                :header="col.header"
                :sortable="col.sortable"
                :exportable="col.exportable !== false"
                :style="col.style"
                :headerStyle="col.headerStyle"
                :bodyStyle="col.bodyStyle"
                :frozen="col.frozen"
                :alignFrozen="col.alignFrozen"
            >
                <template #body="slotProps" v-if="col.body">
                    <!-- Handle action buttons specially -->
                    <template v-if="typeof col.body === 'function' && col.body(slotProps.data)?.type === 'buttons'">
                        <div class="action-buttons">
                            <Button v-for="(action, actionIndex) in col.body(slotProps.data).actions" :key="actionIndex" :icon="action.icon" :class="action.class" @click="$emit('column-action', action.type, action.id)" />
                        </div>
                    </template>
                    <!-- Regular content -->
                    <template v-else>
                        {{ typeof col.body === 'function' ? col.body(slotProps.data) : '' }}
                    </template>
                </template>
            </Column>

            <!-- Support for additional slots if needed -->
            <template v-for="(_, name) in $slots" #[name]="slotData">
                <slot :name="name" v-bind="slotData || {}"></slot>
            </template>
        </DataTable>

        <div v-if="paginator && showPaginationInfo" class="p-mt-2 pagination-info text-center text-sm text-gray-600">Showing {{ paginatorInfo.start }} to {{ paginatorInfo.end }} of {{ paginatorInfo.total }} entries</div>

        <slot name="footer"></slot>
    </div>
</template>

<script setup>
import { useTable } from '@/composables/useTable';
import { ref, watch } from 'vue';

const props = defineProps({
    value: {
        type: Array,
        default: () => []
    },
    modelValue: {
        type: [Object, Array],
        default: null
    },
    paginator: {
        type: Boolean,
        default: true
    },
    rows: {
        type: Number,
        default: 10
    },
    rowsPerPageOptions: {
        type: Array,
        default: () => [5, 10, 20, 50]
    },
    loading: {
        type: Boolean,
        default: false
    },
    dataKey: {
        type: String,
        default: 'id'
    },
    filters: {
        type: Object,
        default: () => ({})
    },
    globalFilterFields: {
        type: Array,
        default: () => []
    },
    sortField: {
        type: String,
        default: null
    },
    sortOrder: {
        type: Number,
        default: null
    },
    lazy: {
        type: Boolean,
        default: false
    },
    totalRecords: {
        type: Number,
        default: 0
    },
    rowClass: {
        type: [Function, String],
        default: null
    },
    exportFilename: {
        type: String,
        default: 'export'
    },
    stripedRows: {
        type: Boolean,
        default: false
    },
    showGridlines: {
        type: Boolean,
        default: false
    },
    size: {
        type: String,
        default: 'normal'
    },
    responsiveLayout: {
        type: String,
        default: 'scroll'
    },
    showPaginationInfo: {
        type: Boolean,
        default: true
    },
    // New prop for column definitions
    columns: {
        type: Array,
        default: () => []
    },
    // Add a custom hook options prop
    tableOptions: {
        type: Object,
        default: () => ({})
    }
});

const emit = defineEmits(['update:modelValue', 'page', 'sort', 'filter', 'row-select', 'row-unselect', 'row-expand', 'row-collapse', 'column-action']);

// Use the custom hook
const { data, first, expandedRows, paginatorInfo, onPage, onSort, onFilter, onRowSelect, onRowUnselect, onRowExpand, onRowCollapse, exportCSV } = useTable({
    rows: props.rows,
    rowsPerPageOptions: props.rowsPerPageOptions,
    sortField: props.sortField,
    sortOrder: props.sortOrder,
    ...props.tableOptions,
    onPage: (event) => emit('page', event),
    onSort: (event) => emit('sort', event),
    onFilter: (event) => emit('filter', event),
    onRowSelect: (event) => emit('row-select', event),
    onRowUnselect: (event) => emit('row-unselect', event),
    onRowExpand: (event) => emit('row-expand', event),
    onRowCollapse: (event) => emit('row-collapse', event)
});

// If you're logging or stringifying objects, use a custom replacer function
const safeStringify = (obj) => {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
        // Skip component, vnode and other circular references
        if (key === 'component' || key === 'vnode' || key === '__v_isRef' || key === '__v_isShallow') {
            return '[Circular Reference]';
        }

        // Handle other potential circular references
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return '[Circular]';
            }
            seen.add(value);
        }
        return value;
    });
};

// Replace any JSON.stringify calls with safeStringify
// For example, if you had something like:
// console.log(JSON.stringify(someObject));
// Change it to:
// console.log(safeStringify(someObject));

// If you're watching or computing values that might contain circular references,
// make sure to either sanitize them or don't stringify them

// When passing data to child components, make sure to only pass what they need
watch(
    () => props.value,
    (newValue) => {
        // Sanitize the value if needed to avoid circular references
        data.value = newValue;
    },
    { immediate: true }
);

watch(
    () => props.totalRecords,
    (newValue) => {
        if (newValue !== undefined) {
            // If totalRecords is provided, use it directly
            // This is useful for lazy loading
        }
    },
    { immediate: true }
);

// Expose public methods to parent components
const dataTableRef = ref(null);

// Expose methods to parent component
defineExpose({
    exportCSV: () => exportCSV(dataTableRef)
});

// Add a method to handle action clicks
const handleAction = (event, column, rowData) => {
    if (column.onClick) {
        column.onClick(rowData);
    }
};
</script>

<style scoped>
.app-datatable {
    width: 100%;
}

.pagination-info {
    margin-top: 0.5rem;
}
</style>
