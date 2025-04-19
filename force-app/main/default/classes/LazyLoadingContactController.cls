// LazyLoadingContactController.apex
public class LazyLoadingContactController {
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContactsData(Integer limitSize, Integer offset) {
        return [
            SELECT Id, FirstName,LastName, Email
            FROM Contact WHERE Name Like 'E%'
            ORDER BY Name 
            LIMIT :limitSize 
            OFFSET :offset
        ];
    }
}