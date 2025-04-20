/*serverSideLazyLoadingInHtmlTableWithScrollBar.js*/
// Import necessary LWC modules and decorators
import { LightningElement, track, api } from "lwc";
// Import Apex method for retrieving contact data
import getContacts from "@salesforce/apex/LazyLoadingContactController.getContactsData";

// Export the class to handle server-side lazy loading of contacts in an HTML table with a scroll bar
export default class ServerSideLazyLoadingInHtmlTableWithScrollBar extends LightningElement {
    // Reactive property to store contact records
    @track contacts = [];
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
        this.loadInitialData();
    }

    /**
     * loadInitialData method fetches contact data from the server.
     * Prevents additional calls if no more records or already loading.
     * Handles server response and updates component state.
     * @param {NA} - No parameters are accepted by this method.
     * @return {void} - This method does not return any value.
     */
    async loadInitialData() {
        // Exit early if all records are loaded or data is currently being fetched
        if (!this.hasMoreRecords || this.isLoading) return;
        // Mark the start of data loading
        this.isLoading = true;
        try {
            // Simulate a delay for loading to mimic real-time API behavior
            await this.loadingDelay();

            // Call the Apex method to fetch contact data
            const result = await getContacts({
                limitSize: this.pageSize,
                offset: this.offset
            });

            if (result.length > 0) {
                // Process the fetched contacts and add serial numbers
                const newContacts = this.processcontacts(result, this.contacts.length);

                // Update the contact list with newly fetched records
                this.contacts = [...this.contacts, ...newContacts];

                // Update the offset to fetch the next batch of records
                this.offset += this.pageSize;

                // Determine if there are more records to load
                this.hasMoreRecords = result.length === this.pageSize;

                // Adjust the scrollable container height dynamically
                this.setScrollableHeight();
            } else {
                // No more records to fetch
                this.hasMoreRecords = false;
            }
        } catch (error) {
            // Log any errors encountered during data fetching
            console.error("Error loading more contacts:", error);
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
     * loadMoreData method triggers loading of the next set of data.
     * Simply calls loadInitialData for consistency.
     * @param {NA} - No parameters are accepted by this method.
     * @return {void} - This method does not return any value.
     */
    async loadMoreData() {
        this.loadInitialData();
    }

    /**
     * allLoaded getter checks if all records have been loaded.
     * @return {boolean} - True if all records are loaded, false otherwise.
     */
    get allLoaded() {
        // Returns true if there are no more records to load and at least one record is present
        return !this.hasMoreRecords && this.contacts.length > 0;
    }

    /**
     * processcontacts method processes the fetched contacts.
     * Adds a serial number to each contact for display purposes.
     * @param {Array} contacts - Array of contact records
     * @param {number} currentLength - Current number of records
     * @return {Array} - Processed contacts with serial numbers
     */
    processcontacts(contacts, currentLength) {
        // Map each contact and add a serial number based on the current contact count
        return contacts.map((contact, index) => ({
            ...contact,
            // Calculate serial number starting from current length
            serialNumber: currentLength + index + 1
        }));
    }

    /**
     * handleScroll method handles scroll events on the container.
     * Triggers loading of more data when near the bottom of the container.
     * Shows or hides the "Back to Top" button based on scroll position.
     * @param {NA} - No parameters are accepted by this method.
     * @return {void} - This method does not return any value.
     */
    handleScroll() {
        // Buffer in pixels to determine when to fetch more data
        const buffer = 10;
        const scrollableContainer = this.template.querySelector(".scrollable");

        if (!scrollableContainer) return;

        // Destructure scroll-related properties for readability
        const { scrollTop, scrollHeight, clientHeight } = scrollableContainer;

        // Check if the user has scrolled near the bottom of the container
        if (scrollHeight - scrollTop - clientHeight < buffer && !this.isLoading) {
            this.loadMoreData();
        }

        // Show or hide the "Back to Top" button based on the scroll position
        const backToTopButton = this.template.querySelector(".back-to-top");
        backToTopButton.style.display = scrollTop > 20 ? "block" : "none";
    }

    /**
     * scrollToTop method scrolls the container back to the top.
     * Uses smooth scrolling for a better user experience.
     * @param {NA} - No parameters are accepted by this method.
     * @return {void} - This method does not return any value.
     */
    scrollToTop() {
        const scrollableContainer = this.template.querySelector(".scrollable");
        if (scrollableContainer) {
            scrollableContainer.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    }

    /**
     * setScrollableHeight method dynamically sets the height of the scrollable container.
     * Ensures consistent visual appearance based on the number of records.
     * @param {NA} - No parameters are accepted by this method.
     * @return {void} - This method does not return any value.
     */
    setScrollableHeight() {
        const scrollableContainer = this.template.querySelector(".scrollable");
        if (scrollableContainer) {
            // Approximate height of each row in pixels
            const rowHeight = 36;

            // Total height calculated based on the number of records per page
            const calculatedHeight = this.pageSize * rowHeight;

            // Set the height of the scrollable container dynamically
            scrollableContainer.style.height = `${calculatedHeight}px`;
        }
    }
}