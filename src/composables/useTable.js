import { computed, ref } from 'vue';

export function useTable(options = {}) {
    // Default options
    const defaultOptions = {
        rows: 10,
        rowsPerPageOptions: [5, 10, 20, 50],
        sortField: null,
        sortOrder: null
    };

    // Merge provided options with defaults
    const tableOptions = { ...defaultOptions, ...options };

    // Reactive state
    const data = ref([]);
    const loading = ref(false);
    const totalRecords = ref(0);
    const selectedItems = ref([]);
    const expandedRows = ref({});
    const filters = ref({});
    const rows = ref(tableOptions.rows);
    const first = ref(0);
    const currentPage = ref(1);
    const sortField = ref(tableOptions.sortField);
    const sortOrder = ref(tableOptions.sortOrder);
    const rowsPerPageOptions = ref(tableOptions.rowsPerPageOptions);

    // Computed properties
    const totalPages = computed(() => {
        return totalRecords.value ? Math.ceil(totalRecords.value / rows.value) : 0;
    });

    const paginatorInfo = computed(() => {
        const start = totalRecords.value ? first.value + 1 : 0;
        const end = Math.min(first.value + rows.value, totalRecords.value);
        return {
            start,
            end,
            total: totalRecords.value
        };
    });

    // Methods
    const onPage = (event) => {
        first.value = event.first;
        rows.value = event.rows;
        currentPage.value = event.page + 1;

        if (options.onPage) {
            options.onPage(event);
        }
    };

    const onSort = (event) => {
        sortField.value = event.sortField;
        sortOrder.value = event.sortOrder;

        if (options.onSort) {
            options.onSort(event);
        }
    };

    const onFilter = (event) => {
        filters.value = event.filters;
        first.value = 0;
        currentPage.value = 1;

        if (options.onFilter) {
            options.onFilter(event);
        }
    };

    const onRowSelect = (event) => {
        if (options.onRowSelect) {
            options.onRowSelect(event);
        }
    };

    const onRowUnselect = (event) => {
        if (options.onRowUnselect) {
            options.onRowUnselect(event);
        }
    };

    const onRowExpand = (event) => {
        if (options.onRowExpand) {
            options.onRowExpand(event);
        }
    };

    const onRowCollapse = (event) => {
        if (options.onRowCollapse) {
            options.onRowCollapse(event);
        }
    };

    const setData = (newData, total = null) => {
        data.value = newData;
        if (total !== null) {
            totalRecords.value = total;
        } else {
            totalRecords.value = newData.length;
        }
    };

    const setLoading = (isLoading) => {
        loading.value = isLoading;
    };

    const clearSelection = () => {
        selectedItems.value = [];
    };

    const exportCSV = (tableRef) => {
        if (tableRef && tableRef.value) {
            tableRef.value.exportCSV();
        }
    };

    // Return the state and methods
    return {
        // State
        data,
        loading,
        totalRecords,
        selectedItems,
        expandedRows,
        filters,
        rows,
        first,
        currentPage,
        sortField,
        sortOrder,
        rowsPerPageOptions,
        totalPages,
        paginatorInfo,

        // Methods
        onPage,
        onSort,
        onFilter,
        onRowSelect,
        onRowUnselect,
        onRowExpand,
        onRowCollapse,
        setData,
        setLoading,
        clearSelection,
        exportCSV
    };
}
