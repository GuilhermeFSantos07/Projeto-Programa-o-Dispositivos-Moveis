import AsyncStorage from "@react-native-async-storage/async-storage";

// Chaves utilizadas para separar os dados de produtos e usuários
const DB_PRODUCTS_KEY = "produtos";
const DB_USERS_KEY = "users";

//Retorna a lista de produtos armazenados.
export const getProducts = async () => {
  try {
    const data = await AsyncStorage.getItem(DB_PRODUCTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Erro ao recuperar os produtos:", error);
    return [];
  }
};

//Salva a lista de produtos no AsyncStorage convertendo o array para JSON
export const saveProducts = async (products) => {
  try {
    await AsyncStorage.setItem(DB_PRODUCTS_KEY, JSON.stringify(products));
  } catch (error) {
    console.error("Erro ao salvar os produtos:", error);
  }
};

//Adiciona um novo produto ao banco de dados.
export const addProduct = async ({ nome, quantidade, valor }) => {
  const products = await getProducts();

  if (products.find((p) => p.nome.toLowerCase() === nome.toLowerCase())) {
    throw new Error("Produto já existe com este nome");
  }

  let newId = "001";
  if (products.length > 0) {
    const lastId = Math.max(...products.map((p) => parseInt(p.id)));
    newId = String(lastId + 1).padStart(3, "0");
  }

  const newProduct = {
    id: newId,
    nome,
    quantidade: parseInt(quantidade),
    valor: parseFloat(valor),
  };

  products.push(newProduct);
  await saveProducts(products);
  return newProduct;
};

//Atualiza os dados de um produto já existente
export const updateProduct = async (updatedProduct) => {
  const products = await getProducts();
  const index = products.findIndex((p) => p.id === updatedProduct.id);
  if (index >= 0) {
    products[index] = updatedProduct;
    await saveProducts(products);
    return true;
  }
  return false;
};

//Procura um produto pelo ID ou nome (a comparação do nome ignora diferenças entre maiúsculas e minúsculas)
export const findProduct = async (query) => {
  const products = await getProducts();
  return products.find(
    (p) =>
      p.id === query || p.nome.toLowerCase() === query.toLowerCase()
  );
};

//Retorna a lista de usuários armazenados
export const getUsers = async () => {
  try {
    const data = await AsyncStorage.getItem(DB_USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Erro ao recuperar os usuários:", error);
    return [];
  }
};

//Salva a lista de usuários no AsyncStorage convertendo o array para JSON
export const saveUsers = async (users) => {
  try {
    await AsyncStorage.setItem(DB_USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("Erro ao salvar os usuários:", error);
  }
};

//Adiciona um novo usuário ao banco de dados
export const addUser = async ({ username, password }) => {
  const users = await getUsers();
  if (users.find((u) => u.username.toLowerCase() === username.toLowerCase())) {
    throw new Error("Usuário já existe.");
  }
  const newUser = { username, password };
  users.push(newUser);
  await saveUsers(users);
  return newUser;
};

//Procura um usuário pelo username e password
export const findUser = async (username, password) => {
  const users = await getUsers();
  return users.find(
    (u) => u.username === username && u.password === password
  );
};
