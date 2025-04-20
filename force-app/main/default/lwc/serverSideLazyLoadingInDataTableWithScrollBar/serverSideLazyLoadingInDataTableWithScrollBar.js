/*serverSideLazyLoadingInDataTableWithScrollBar.js*/
// Import necessary LWC modules and decorators
import { LightningElement } from "lwc";
// Import Apex method for retrieving account data
import getAccounts from "@salesforce/apex/LazyLoadingAccountController.getAccounts";

// Define the columns for the datatable
const columns = [
    { label: "Name", fieldName: "Name", type: "text", hideDefaultActions: true },
    {
        label: "Rating",
        fieldName: "Rating",
        type: "text",
        hideDefaultActions: true
    }
];

// Export the class to handle server-side lazy loading of accounts in a datatable with a scroll bar
export default class ServerSideLazyLoadingInDataTableWithScrollBar extends LightningElement {
    // Reactive property to store account records
    accounts = [];
    // Reactive property to define the datatable columns
    columns = columns;
    // Number of records per page
    pageSize = 5;
    // Offset for pagination, keeps track of the starting point for the next batch of records
    offset = 0;
    // Boolean flag to check if there are more records available to load
    hasMoreRecords = true;
    // Status message for data loading
    loadMoreStatus;
    // Boolean flag to track if data is being fetched
    isLoading = false;

    /**
     * Lifecycle hook invoked when the component is inserted into the DOM.
     * Calls the method to load the initial data.
     */
    connectedCallback() {
        this.loadData();
    }

    /**
     * loadData method fetches account data from the server.
     * Prevents additional calls if no more records or already loading.
     * Handles server response and updates component state.
     * @param {NA} - No parameters are accepted by this method.
     * @return {void} - This method does not return any value.
     */
    async loadData() {
        // Exit early if no records left or already loading
        if (!this.hasMoreRecords || this.isLoading) return;
        // Mark the start of data loading
        this.isLoading = true;
        try {
            // Call the Apex method to fetch account data
            const result = await getAccounts({
                limitSize: this.pageSize, // Number of records to fetch
                offset: this.offset // Starting point for fetching
            });
            if (result) {
                // Append the newly fetched accounts to the existing list
                this.accounts = [...this.accounts, ...result];
                // Update the flag to determine if there are more records to load
                this.hasMoreRecords = result.length === this.pageSize;
                // Update the loading status message
                this.loadMoreStatus = this.hasMoreRecords
                    ? "Loading accounts...."
                    : "No more records to load";
                // Adjust the scrollable container height
                this.setScrollableHeight();
            }
        } catch (error) {
            // Log any errors encountered during data fetching
            console.error("Error loading more accounts:", error);
            this.loadMoreStatus = "Error loading data";
        } finally {
            // Mark the end of data loading
            this.isLoading = false;
        }
    }

    /**
     * loadMoreData method triggers loading of the next set of data when the user scrolls or interacts.
     * @param {event} event - The event object from the interaction.
     * @return {void} - This method does not return any value.
     */
    async loadMoreData(event) {
        let target = event.target;
        // Indicate the loading process on the target
        target.isLoading = true;
        // Increment the offset for the next batch of records
        this.offset += this.pageSize;
        // Load the next set of data
        await this.loadData();
        // Indicate the end of loading process on the target
        target.isLoading = false;
    }

    /**
     * allLoaded getter checks if all records have been loaded.
     * @return {boolean} - True if all records are loaded, false otherwise.
     */
    get allLoaded() {
        // Returns true if there are no more records to load and at least one record is present
        return !this.hasMoreRecords && this.accounts.length > 0;
    }

    /**
     * setScrollableHeight method dynamically sets the height of the scrollable container.
     * Ensures consistent visual appearance based on the number of records.
     * @param {NA} - No parameters are accepted by this method.
     * @return {void} - This method does not return any value.
     */
    setScrollableHeight() {
        const scrollableContainer = this.template.querySelector(".table-container");
        if (scrollableContainer) {
            // Approximate height of each row; adjust as needed per requirement
            // e.g. for 3 rows - 38.2 will work
            // for 5 row - 34 will work
            const rowHeight = 34.5;
            // Calculate the container height
            const calculatedHeight = this.pageSize * rowHeight;
            // Apply the height
            scrollableContainer.style.height = `${calculatedHeight}px`;
        }
    }
}