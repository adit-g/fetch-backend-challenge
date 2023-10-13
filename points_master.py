
items = [("Ben & Jerry chocolate ice cream", "Ben_and_Jerry"), 
         ("Klondike ice cream", "Klondike"), 
         ("Purity ice cream", "Purity"),
         ("Mayfield ice cream", "Mayfield"),
         ("Ben & Jerry vanilla ice cream", "Ben_and_Jerry")] 

special_brands = ["Ben_and_Jerry", "Klondike", "Dove", "Degree"]
special_items_dict = {}
for brand in special_brands:
    special_items_dict[brand] = [0]

items_points_list = []
total_points = 0
for (i, item) in enumerate(items): 
    #rule 1
    total_points += 5
    items_points_list.append([item[0], 5])

    brand = item[1]
    #rule 2
    if brand in special_brands:
        special_items_dict[brand][0] += 1
        total_points += 10
        items_points_list[-1][1] += 10

        #rule 3
        count = special_items_dict[brand][0]
        if count % 2 == 0:
            index = special_items_dict[brand][1]
            items_points_list[index][1] += 5
            items_points_list[-1][1] += 5
            total_points += 10
        
        special_items_dict[brand].append(i)

print(items_points_list)
print(total_points)