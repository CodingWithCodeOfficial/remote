import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { db } from '../firebaseConfig';
import { collection, onSnapshot, doc, addDoc, getDoc } from "firebase/firestore";
import '../App.css';
import FoodAddCard from "../components/foodAddCard";

function FoodAdd() {
  const [food, setFood] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");  // State for search term
  const navigate = useNavigate();
  const foodCollectionRef = collection(db, "food");
  const displayFoodCollectionRef = collection(db, "display-food");

  // Load menu items from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(foodCollectionRef, (snapshot) => {
      const updatedFood = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setFood(updatedFood);
      setIsLoading(false);
    }, (error) => {
      console.error("Error loading menu items: ", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle table selection
  const handleTableSelect = (tableNumber) => {
    setSelectedTable(tableNumber);
  };

  // Add selected food item to the display-food collection with table info
  const addNewOrder = async (foodId) => {
    try {
      if (!selectedTable) {
        alert("Please select a table first.");
        return;
      }

      const foodItem = doc(db, "food", foodId);
      const foodData = await getDoc(foodItem);
      const data = { ...foodData.data(), table: selectedTable, status: "Pending" };
      await addDoc(displayFoodCollectionRef, data);
      alert("Food added successfully!");
    } catch (error) {
      console.error("Error adding food item: ", error);
    }
  };

  // Filter food items based on search term
  const filteredFood = food.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <h1>TableSync</h1>
      <h1 className='foodadd'>Food Add Page</h1>
      <button onClick={() => navigate("/fooddisplay")}>Navigate to Food Display Page</button>

      {/* Table Selection Page */}
      {!selectedTable ? (
        <div>
          <h2>Select a Table</h2>
          <button onClick={() => handleTableSelect(1)}>Table 1</button>
          <button onClick={() => handleTableSelect(2)}>Table 2</button>
          <button onClick={() => handleTableSelect(3)}>Table 3</button>
          <button onClick={() => handleTableSelect(4)}>Table 4</button>
        </div>
      ) : (
        // Menu Item Selection Page
        <div>
          <h2>Selected Table: {selectedTable}</h2>
          <h3>Choose Menu Items:</h3>
          
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search Food..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          {isLoading ? (
            <p>Loading menu...</p>
          ) : (
            filteredFood.map((item) => (
              <FoodAddCard
                key={item.id}
                name={item.name}
                img={item.img}
                description={item.description}
                onAdd={() => addNewOrder(item.id)}
              />
            ))
          )}
          <button onClick={() => setSelectedTable(null)}>Back to Table Selection</button>
        </div>
      )}

      <br />
      <div>
        <button onClick={() => navigate("/tablefooddisplay/1")}>Table Food Display 1</button>
        <button onClick={() => navigate("/tablefooddisplay/2")}>Table Food Display 2</button>
        <button onClick={() => navigate("/tablefooddisplay/3")}>Table Food Display 3</button>
        <button onClick={() => navigate("/tablefooddisplay/4")}>Table Food Display 4</button>
      </div>
    </>
  );
}

export default FoodAdd;
