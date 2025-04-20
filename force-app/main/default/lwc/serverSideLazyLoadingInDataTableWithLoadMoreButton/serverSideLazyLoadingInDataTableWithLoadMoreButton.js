/*serverSideLazyLoadingInDataTableWithLoadMoreButton.js*/
// Import necessary LWC modules and decorators
import { LightningElement, track, api } from 'lwc';
// Import Apex method for retrieving account data
import getAccounts from '@salesforce/apex/LazyLoadingAccountController.getAccountsData';

// Define the columns for the datatable
const COLUMNS = [
    {
        label: 'Account Name',
        fieldName: 'Name',
        type: 'text',
        sortable: false,
        hideDefaultActions: true,
    },
    {
        label: 'Industry',
        fieldName: 'Industry',
        type: 'text',
        sortable: false,
        hideDefaultActions: true,
    }
];

// Export the class to handle server-side lazy loading of accounts in a datatable with a "Load More" button
export default class ServerSideLazyLoadingInDataTableWithLoadMoreButton extends LightningElement {
    // Reactive property to store account records
    @track accounts = [];
    // Reactive property to define the datatable columns
    @track columns = COLUMNS;
    // Public property to define the number of records per page
    @api pageSize = 5;
    // Offset for pagination, keeps track of the starting point for the next batch of records
    offset = 0;
    // Boolean flag to track if data is being fetched
    isLoading = false;
    // Boolean flag to check if there are more records available to load
    hasMoreRecords = true;

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
        // Exit early if all records are loaded or data is currently being fetched
        if (!this.hasMoreRecords || this.isLoading) return;
        // Mark the start of data loading
        this.isLoading = true;
        try {
            // Simulate a delay for loading to mimic real-time API behavior
            await this.loadingDelay();

            // Call the Apex method to fetch account data
            const result = await getAccounts({
                limitSize: this.pageSize,
                offset: this.offset
            });

            if (result.length > 0) {
                // Append the newly fetched accounts to the existing list
                this.accounts = [...this.accounts, ...result];

                // Update the offset to fetch the next batch of records
                this.offset += this.pageSize;

                // Determine if there are more records to load
                this.hasMoreRecords = result.length === this.pageSize;
            } else {
                // No more records to fetch
                this.hasMoreRecords = false;
            }
        } catch (error) {
            // Log any errors encountered during data fetching
            console.error("Error loading more accounts:", error);
        } finally {
            // Mark the end of data loading
            this.isLoading = false;
        }
    }

    /**
     * loadingDelay method simulates a delay for data fetching.
     * @param {NA} - No parameters are accepted by this method.
     * @return {Promise} - Resolves after 1 second
     */
    loadingDelay() {
        // Simulate a network delay of 1 second
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        return new Promise((resolve) => setTimeout(resolve, 1000));
    }

    /**
     * handleLoadMore method triggers loading of the next set of data.
     * Also initializes scroll-related events for user interaction.
     * @param {NA} - No parameters are accepted by this method.
     * @return {void} - This method does not return any value.
     */
    handleLoadMore() {
        this.loadData();
        this.handleScrollEvent();
    }

    /**
     * handleScrollEvent method monitors window scroll events.
     * Displays or hides the "Back to Top" button based on scroll position.
     * @param {NA} - No parameters are accepted by this method.
     * @return {void} - This method does not return any value.
     */
    handleScrollEvent() {
        window.addEventListener('scroll', () => {
            const backToTopButton = this.template.querySelector('.back-to-top');
            // Show the button if the user has scrolled down, otherwise hide it
            if (window.scrollY > 20) {
                backToTopButton.style.display = 'block';
            } else {
                backToTopButton.style.display = 'none';
            }
        });
    }

    /**
     * scrollToTop method scrolls the page back to the top.
     * Uses smooth scrolling for a better user experience.
     * @param {NA} - No parameters are accepted by this method.
     * @return {void} - This method does not return any value.
     */
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    /**
     * allLoaded getter checks if all records have been loaded.
     * @return {boolean} - True if all records are loaded, false otherwise.
     */
    get allLoaded() {
        // Returns true if there are no more records to load and at least one record is present
        return !this.hasMoreRecords && this.accounts.length > 0;
    }
}