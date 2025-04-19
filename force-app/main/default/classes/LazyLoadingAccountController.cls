//LazyLoadingAccountController.apex
public class LazyLoadingAccountController {
    @AuraEnabled
    public static List<Account> getAccountsData(Integer limitSize, Integer offset) {
        return [
            SELECT Id, Name, Industry 
            FROM Account 
            ORDER BY Name 
            LIMIT :limitSize 
            OFFSET :offset
        ];
    }
}