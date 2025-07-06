/* eslint-disable @lwc/lwc/no-async-operation */
import { LightningElement, api } from "lwc";
import getAllContacts from "@salesforce/apex/LazyLoadingContactController.getAllContacts";

export default class ClientSideLazyLoadingWithHtmlTableWithScrollBar extends LightningElement {
  // property to store all contacts fetched from the server
  allContacts = [];
  // property to store currently visible contacts in the table
  visibleContacts = [];
  // public property to define the number of records per page
  @api pageSize = 5;
  // offset for pagination, keeps track of the starting point for the next batch of records
  offset = 0;
  // boolean flag to track if data is being fetched
  isLoading = false;

  /**
   * @description - connectedCallback lifecycle hook invoked when the component is inserted into the DOM.
   * Calls the method to load the initial data.
   */
  connectedCallback() {
    // Load all contacts when the component is initialized
    this.loadAllContacts();
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
   * @description - loadAllContacts method fetches all contact data from the server.
   * It processes the contacts to add a serial number and sets the initial visible contacts.
   * Handles loading state and errors.
   * @param {NA} - No parameters are accepted by this method.
   * @return {void} - This method does not return any value.
   */
  async loadAllContacts() {
    // Mark the start of data loading
    this.isLoading = true;

    try {
      // Simulate a delay for loading to mimic real-time API behavior
      await this.loadingDelay();

      // Call the Apex method to fetch all contacts
      const result = await getAllContacts();
      if (result.length > 0) {
        // If no contacts are returned, exit the method
        this.allContacts = result.map((contact, idx) => ({
          ...contact,
          serialNumber: idx + 1
        }));

        // SET the initial visible contacts based on the page size
        this.visibleContacts = this.allContacts.slice(0, this.pageSize);

        // Set the offset to the page size to prepare for loading more data
        this.offset = this.pageSize;

        // Set the scrollable height based on the number of records
        this.setScrollableHeight();
      }
    } catch (error) {
      // Log the error to the console if there is an issue loading contacts
      console.error("Error loading contacts:", error);
    } finally {
      // Ensure the loading state is reset after attempting to load contacts
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
   * @description - handleScroll method handles the scroll event to load more data when the user scrolls near the bottom.
   * It also shows or hides the "Back to Top" button based on the scroll position.
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
    if (
      scrollHeight - scrollTop - clientHeight < buffer &&
      !this.isLoading &&
      !this.allLoaded
    ) {
      // If the user has scrolled near the bottom, load more data
      this.loadMoreData();
    }

    // Show or hide the "Back to Top" button based on the scroll position
    const backToTopButton = this.template.querySelector(".back-to-top");

    // If the scrollTop is greater than 20 pixels, show the button; otherwise, hide it
    backToTopButton.style.display = scrollTop > 20 ? "block" : "none";
  }

  /**
   * @description - loadMoreData method loads the next set of contact records.
   * It checks if there are more records to load and updates the visible contacts.
   * If the offset is greater than or equal to the total number of contacts, it exits the method.
   * @param {NA} - No parameters are accepted by this method.
   * @return {void} - This method does not return any value.
   */
  async loadMoreData() {
    // If the offset is greater than or equal to the total number of contacts, exit the method
    if (this.offset >= this.allContacts.length) return;

    // Set loading state to true, simulate a delay for loading more data
    this.isLoading = true;
    // Simulate a delay for loading to mimic real-time API behavior
    await this.loadingDelay();

    const nextContacts = this.allContacts.slice(
      this.offset,
      this.offset + this.pageSize
    );
    this.visibleContacts = [...this.visibleContacts, ...nextContacts];
    this.offset += this.pageSize;
    this.isLoading = false;
  }

  /**
   * allLoaded getter checks if all records have been loaded.
   * @return {boolean} - True if all records are loaded, false otherwise.
   */
  get allLoaded() {
    // Returns true if the number of visible contacts is greater than or equal to all contacts
    return (
      this.visibleContacts.length >= this.allContacts.length &&
      this.allContacts.length > 0
    );
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