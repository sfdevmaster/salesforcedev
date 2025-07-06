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
     * @description - connectedCallback lifecycle hook invoked when the component is inserted into the DOM.
     * Calls the method to load the initial data.
     */
    connectedCallback() {
        // Load initial data when the component is initialized
        this.loadInitialData();
    }

    /**
     * @description - renderedCallback lifecycle hook invoked after the component has been rendered.
     * Calls the method to set the scrollable height.
     */
    renderedCallback() {
        // set the scrollable height after the component is rendered
        this.setScrollableHeight();
    }

    /**
     * @description - loadInitialData method fetches contact data from the server.
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
     * @description - loadingDelay method simulates a delay for data fetching.
     * @param {NA} - No parameters are accepted by this method.
     * @return {Promise} - Resolves after 1 second
     */
    loadingDelay() {
        // Simulate a network delay of 1 second
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        return new Promise((resolve) => setTimeout(resolve, 1000));
    }

    /**
     * @description - loadMoreData method triggers loading of the next set of data.
     * Simply calls loadInitialData for consistency.
     * @param {NA} - No parameters are accepted by this method.
     * @return {void} - This method does not return any value.
     */
    async loadMoreData() {
        // Call the loadInitialData method to load more data
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
     * @description - processcontacts method processes the fetched contacts.
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
     * @description - handleScroll method handles scroll events on the container.
     * Triggers loading of more data when near the bottom of the container.
     * Shows or hides the "Back to Top" button based on scroll position.
     * @param {NA} - No parameters are accepted by this method.
     * @return {void} - This method does not return any value.
     */
    handleScroll() {
        // declare a buffer to trigger loading more data before reaching the bottom
        const buffer = 10;
        // declare a scrollable container
        const scrollableContainer = this.template.querySelector(".scrollable");

        // if scrollableContainer is not found, exit the method
        if (!scrollableContainer) return;

        // destructure scrollTop, scrollHeight, and clientHeight from the scrollableContainer
        // scrollTop is the number of pixels that the content of an element is scrolled vertically
        // scrollHeight is the total height of the content in the element, including content not visible
        // clientHeight is the height of the visible content in the element
        const { scrollTop, scrollHeight, clientHeight } = scrollableContainer;

        // Check if the user has scrolled near the bottom of the container
        if (scrollHeight - scrollTop - clientHeight < buffer && !this.isLoading) {
            // If the user has scrolled near the bottom, load more data
            this.loadMoreData();
        }

        // Show or hide the "Back to Top" button based on the scroll position
        const backToTopButton = this.template.querySelector(".back-to-top");

        // If the scrollTop is greater than 20 pixels, show the button; otherwise, hide it
        backToTopButton.style.display = scrollTop > 20 ? "block" : "none";
    }

    /**
     * @description - scrollToTop method scrolls the container back to the top.
     * Uses smooth scrolling for a better user experience.
     * @param {NA} - No parameters are accepted by this method.
     * @return {void} - This method does not return any value.
     */
    scrollToTop() {
        // Get the scrollable container element
        const scrollableContainer = this.template.querySelector(".scrollable");

        // If the scrollable container is found, scroll to the top smoothly
        if (scrollableContainer) {
            // Scroll to the top of the scrollable container
            scrollableContainer.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    }

    /**
     * setScrollableHeight method dynamically sets the height of the scrollable container.
     * Ensures consistent visual appearance based on the number of records.
     * Make sure set the row height in px according to your page size.
     * @param {NA} - No parameters are accepted by this method.
     * @return {void} - This method does not return any value.
     */
    setScrollableHeight() {
        // Get the scrollable container element
        const scrollableContainer = this.template.querySelector(".scrollable");

        // If the scrollable container is not found, exit the method
        if (scrollableContainer) {
            // Find the first table row to measure its height
            const firstRow = scrollableContainer.querySelector("tbody tr");

            // If the first row is found, calculate the height of the scrollable container
            if (firstRow) {
                // Set the row height based on the page size
                let rowHeight = 36;
                // If the page size is less than 9, set a specific height
                if (this.pageSize < 9) {
                    // Add a small offset to the row height for better spacing
                    rowHeight = firstRow.getBoundingClientRect().height + 4.8;
                } else if (this.pageSize < 12) {
                    // If the page size is less than 12, set a different height
                    rowHeight = 31;
                } else {
                    // For larger page sizes, set a standard height
                    rowHeight = 30;
                }

                // Calculate the total height of the scrollable container based on the page size and row height
                const calculatedHeight = this.pageSize * rowHeight;

                // Set the height of the scrollable container dynamically
                scrollableContainer.style.height = `${calculatedHeight}px`;
            }
        }
    }
}