export interface DistrictUpazilas {
  district: string;
  division: string;
  upazilas: string[];
}

/** Every upazila in Bangladesh, grouped by district. Source: Bangladesh administrative divisions. */
export const BD_UPAZILAS: DistrictUpazilas[] = [
  // ── Rajshahi Division ──
  { division: 'Rajshahi', district: 'Bogura', upazilas: ['Adamdighi', 'Bogura Sadar', 'Dhunat', 'Dhupchanchia', 'Gabtali', 'Kahaloo', 'Nandigram', 'Sariakandi', 'Shajahanpur', 'Sherpur', 'Shibganj', 'Sonatola', 'Mokamtola'] },
  { division: 'Rajshahi', district: 'Chapai Nawabganj', upazilas: ['Bholahat', 'Gomastapur', 'Nachole', 'Nawabganj Sadar', 'Shibganj'] },
  { division: 'Rajshahi', district: 'Joypurhat', upazilas: ['Akkelpur', 'Joypurhat Sadar', 'Kalai', 'Khetlal', 'Panchbibi'] },
  { division: 'Rajshahi', district: 'Naogaon', upazilas: ['Atrai', 'Badalgachhi', 'Dhamoirhat', 'Manda', 'Mohadevpur', 'Naogaon Sadar', 'Niamatpur', 'Patnitala', 'Porsha', 'Raninagar', 'Sapahar'] },
  { division: 'Rajshahi', district: 'Natore', upazilas: ['Bagatipara', 'Baraigram', 'Gurudaspur', 'Lalpur', 'Naldanga', 'Natore Sadar', 'Singra'] },
  { division: 'Rajshahi', district: 'Pabna', upazilas: ['Atgharia', 'Bera', 'Bhangura', 'Chatmohar', 'Faridpur', 'Ishwardi', 'Pabna Sadar', 'Santhia', 'Sujanagar'] },
  { division: 'Rajshahi', district: 'Rajshahi', upazilas: ['Bagha', 'Bagmara', 'Charghat', 'Durgapur', 'Godagari', 'Mohanpur', 'Paba', 'Puthia', 'Tanore'] },
  { division: 'Rajshahi', district: 'Sirajganj', upazilas: ['Belkuchi', 'Chauhali', 'Kamarkhanda', 'Kazipur', 'Raiganj', 'Shahjadpur', 'Sirajganj Sadar', 'Tarash', 'Ullahpara'] },

  // ── Rangpur Division ──
  { division: 'Rangpur', district: 'Dinajpur', upazilas: ['Biral', 'Birampur', 'Birganj', 'Bochaganj', 'Chirirbandar', 'Dinajpur Sadar', 'Ghoraghat', 'Hakimpur', 'Kaharole', 'Khansama', 'Nawabganj', 'Parbatipur', 'Phulbari'] },
  { division: 'Rangpur', district: 'Gaibandha', upazilas: ['Gaibandha Sadar', 'Gobindaganj', 'Palashbari', 'Phulchhari', 'Sadullapur', 'Sughatta', 'Sundarganj'] },
  { division: 'Rangpur', district: 'Kurigram', upazilas: ['Bhurungamari', 'Char Rajibpur', 'Chilmari', 'Kurigram Sadar', 'Nageshwari', 'Phulbari', 'Rajarhat', 'Raomari', 'Ulipur'] },
  { division: 'Rangpur', district: 'Lalmonirhat', upazilas: ['Aditmari', 'Hatibandha', 'Kaliganj', 'Lalmonirhat Sadar', 'Patgram'] },
  { division: 'Rangpur', district: 'Nilphamari', upazilas: ['Dimla', 'Domar', 'Jaldhaka', 'Kishoreganj', 'Nilphamari Sadar', 'Saidpur'] },
  { division: 'Rangpur', district: 'Panchagarh', upazilas: ['Atwari', 'Boda', 'Debiganj', 'Panchagarh Sadar', 'Tetulia'] },
  { division: 'Rangpur', district: 'Rangpur', upazilas: ['Badarganj', 'Gangachhara', 'Kaunia', 'Mithapukur', 'Pirgachha', 'Pirganj', 'Rangpur Sadar', 'Taraganj'] },
  { division: 'Rangpur', district: 'Thakurgaon', upazilas: ['Baliadangi', 'Haripur', 'Pirganj', 'Ranisankail', 'Thakurgaon Sadar', 'Ruhia', 'Bhully'] },

  // ── Mymensingh Division ──
  { division: 'Mymensingh', district: 'Jamalpur', upazilas: ['Baksiganj', 'Dewanganj', 'Islampur', 'Jamalpur Sadar', 'Madarganj', 'Melandaha', 'Sarishabari'] },
  { division: 'Mymensingh', district: 'Mymensingh', upazilas: ['Bhaluka', 'Dhobaura', 'Fulbaria', 'Gafargaon', 'South Gafargaon', 'Gauripur', 'Haluaghat', 'Ishwarganj', 'Muktagachha', 'Mymensingh Sadar', 'Nandail', 'Phulpur', 'Tara Khanda', 'Trishal'] },
  { division: 'Mymensingh', district: 'Netrokona', upazilas: ['Atpara', 'Barhatta', 'Durgapur', 'Kalmakanda', 'Khaliajuri', 'Kendua', 'Madan', 'Mohanganj', 'Netrokona Sadar', 'Purbadhala'] },
  { division: 'Mymensingh', district: 'Sherpur', upazilas: ['Jhenaigati', 'Nakla', 'Nalitabari', 'Sherpur Sadar', 'Sreebardi'] },

  // ── Barisal Division ──
  { division: 'Barisal', district: 'Barguna', upazilas: ['Amtali', 'Bamna', 'Barguna Sadar', 'Betagi', 'Patharghata', 'Taltali'] },
  { division: 'Barisal', district: 'Barisal', upazilas: ['Agailjhara', 'Babuganj', 'Bakerganj', 'Banaripara', 'Barisal Sadar', 'Gaurnadi', 'Hizla', 'Mehendiganj', 'Muladi', 'Wazirpur'] },
  { division: 'Barisal', district: 'Bhola', upazilas: ['Bhola Sadar', 'Burhanuddin', 'Char Fasson', 'Daulatkhan', 'Lalmohan', 'Manpura', 'Tazumuddin'] },
  { division: 'Barisal', district: 'Jhalokati', upazilas: ['Jhalokati Sadar', 'Kathalia', 'Nalchity', 'Rajapur'] },
  { division: 'Barisal', district: 'Patuakhali', upazilas: ['Bauphal', 'Dashmina', 'Dumki', 'Galachipa', 'Kalapara', 'Mirzaganj', 'Patuakhali Sadar', 'Rangabali'] },
  { division: 'Barisal', district: 'Pirojpur', upazilas: ['Bhandaria', 'Indurkani', 'Kawkhali', 'Mathbaria', 'Nazirpur', 'Nesarabad (Swarupkati)', 'Pirojpur Sadar'] },

  // ── Chittagong Division ──
  { division: 'Chittagong', district: 'Bandarban', upazilas: ['Ali Kadam', 'Bandarban Sadar', 'Lama', 'Naikhongchhari', 'Rowangchhari', 'Ruma', 'Thanchi'] },
  { division: 'Chittagong', district: 'Brahmanbaria', upazilas: ['Akhaura', 'Bancharampur', 'Brahmanbaria Sadar', 'Kasba', 'Nabinagar', 'Nasirnagar', 'Sarail', 'Ashuganj', 'Bijoynagar'] },
  { division: 'Chittagong', district: 'Chandpur', upazilas: ['Chandpur Sadar', 'Faridganj', 'Haimchar', 'Haziganj', 'Kachua', 'Matlab Dakshin', 'Matlab Uttar', 'Shahrasti'] },
  { division: 'Chittagong', district: 'Chittagong', upazilas: ['Anwara', 'Banshkhali', 'Boalkhali', 'Chandanaish', 'Fatikchhari', 'Hathazari', 'Karnaphuli', 'Lohagara', 'Mirsharai', 'Patiya', 'Rangunia', 'Raozan', 'Sandwip', 'Satkania', 'Sitakunda'] },
  { division: 'Chittagong', district: 'Cumilla', upazilas: ['Bangra', 'Barura', 'Brahmanpara', 'Burichang', 'Chandina', 'Chauddagram', 'Daudkandi', 'Debidwar', 'Homna', 'Laksam', 'Lalmai', 'Muradnagar', 'Nangalkot', 'Cumilla Adarsha Sadar', 'Meghna', 'Titas', 'Monohargonj', 'Cumilla Sadar Dakshin'] },
  { division: 'Chittagong', district: "Cox's Bazar", upazilas: ['Chakaria', "Cox's Bazar Sadar", 'Kutubdia', 'Maheshkhali', 'Ramu', 'Teknaf', 'Ukhia', 'Pekua', 'Eidgaon', 'Matamuhuri'] },
  { division: 'Chittagong', district: 'Feni', upazilas: ['Chhagalnaiya', 'Daganbhuiyan', 'Feni Sadar', 'Parshuram', 'Sonagazi', 'Fulgazi'] },
  { division: 'Chittagong', district: 'Khagrachhari', upazilas: ['Dighinala', 'Khagrachhari Sadar', 'Lakshmichhari', 'Mahalchhari', 'Manikchhari', 'Matiranga', 'Panchhari', 'Ramgarh', 'Guimara'] },
  { division: 'Chittagong', district: 'Lakshmipur', upazilas: ['Lakshmipur Sadar', 'Raipur', 'Ramganj', 'Ramgati', 'Kamalnagar', 'Chandraganj'] },
  { division: 'Chittagong', district: 'Noakhali', upazilas: ['Begumganj', 'Noakhali Sadar', 'Chatkhil', 'Companiganj', 'Hatiya', 'Senbagh', 'Sonaimuri', 'Subarnachar', 'Kabirhat'] },
  { division: 'Chittagong', district: 'Rangamati', upazilas: ['Bagaichhari', 'Barkal', 'Kawkhali', 'Belaichhari', 'Kaptai', 'Juraichhari', 'Langadu', 'Naniyachar', 'Rajasthali', 'Rangamati Sadar'] },

  // ── Dhaka Division ──
  { division: 'Dhaka', district: 'Dhaka', upazilas: ['Dhamrai', 'Dohar', 'Keraniganj', 'Nawabganj', 'Savar'] },
  { division: 'Dhaka', district: 'Faridpur', upazilas: ['Alfadanga', 'Bhanga', 'Boalmari', 'Charbhadrasan', 'Faridpur Sadar', 'Madhukhali', 'Nagarkanda', 'Sadarpur', 'Saltha'] },
  { division: 'Dhaka', district: 'Gazipur', upazilas: ['Gazipur Sadar', 'Kaliakair', 'Kaliganj', 'Kapasia', 'Sreepur'] },
  { division: 'Dhaka', district: 'Gopalganj', upazilas: ['Gopalganj Sadar', 'Kashiani', 'Kotalipara', 'Muksudpur', 'Tungipara'] },
  { division: 'Dhaka', district: 'Kishoreganj', upazilas: ['Austagram', 'Bajitpur', 'Bhairab', 'Hossainpur', 'Itna', 'Karimganj', 'Katiadi', 'Kishoreganj Sadar', 'Kuliarchar', 'Mithamain', 'Nikli', 'Pakundia', 'Tarail'] },
  { division: 'Dhaka', district: 'Madaripur', upazilas: ['Rajoir', 'Madaripur Sadar', 'Kalkini', 'Shibchar', 'Dasar'] },
  { division: 'Dhaka', district: 'Manikganj', upazilas: ['Daulatpur', 'Ghior', 'Harirampur', 'Manikgonj Sadar', 'Saturia', 'Shivalaya', 'Singair'] },
  { division: 'Dhaka', district: 'Munshiganj', upazilas: ['Gazaria', 'Lohajang', 'Munshiganj Sadar', 'Sirajdikhan', 'Sreenagar', 'Tongibari'] },
  { division: 'Dhaka', district: 'Narayanganj', upazilas: ['Araihazar', 'Bandar', 'Narayanganj Sadar', 'Rupganj', 'Sonargaon'] },
  { division: 'Dhaka', district: 'Narsingdi', upazilas: ['Narsingdi Sadar', 'Belabo', 'Monohardi', 'Palash', 'Raipura', 'Shibpur'] },
  { division: 'Dhaka', district: 'Rajbari', upazilas: ['Baliakandi', 'Goalandaghat', 'Pangsha', 'Rajbari Sadar', 'Kalukhali'] },
  { division: 'Dhaka', district: 'Shariatpur', upazilas: ['Bhedarganj', 'Damudya', 'Gosairhat', 'Naria', 'Shariatpur Sadar', 'Zajira'] },
  { division: 'Dhaka', district: 'Tangail', upazilas: ['Gopalpur', 'Basail', 'Bhuapur', 'Delduar', 'Ghatail', 'Kalihati', 'Madhupur', 'Mirzapur', 'Nagarpur', 'Sakhipur', 'Dhanbari', 'Tangail Sadar'] },

  // ── Khulna Division ──
  { division: 'Khulna', district: 'Bagerhat', upazilas: ['Bagerhat Sadar', 'Chitalmari', 'Fakirhat', 'Kachua', 'Mollahat', 'Mongla', 'Morrelganj', 'Rampal', 'Sarankhola'] },
  { division: 'Khulna', district: 'Chuadanga', upazilas: ['Alamdanga', 'Chuadanga Sadar', 'Damurhuda', 'Jibannagar'] },
  { division: 'Khulna', district: 'Jashore', upazilas: ['Abhaynagar', 'Bagherpara', 'Chaugachha', 'Jhikargachha', 'Keshabpur', 'Jashore Sadar', 'Manirampur', 'Sharsha'] },
  { division: 'Khulna', district: 'Jhenaidah', upazilas: ['Harinakunda', 'Jhenaidah Sadar', 'Kaliganj', 'Kotchandpur', 'Maheshpur', 'Shailkupa'] },
  { division: 'Khulna', district: 'Khulna', upazilas: ['Batiaghata', 'Dacope', 'Dumuria', 'Dighalia', 'Koyra', 'Paikgachha', 'Phultala', 'Rupsha', 'Terokhada'] },
  { division: 'Khulna', district: 'Kushtia', upazilas: ['Bheramara', 'Daulatpur', 'Khoksa', 'Kumarkhali', 'Kushtia Sadar', 'Mirpur'] },
  { division: 'Khulna', district: 'Magura', upazilas: ['Magura Sadar', 'Mohammadpur', 'Shalikha', 'Sreepur'] },
  { division: 'Khulna', district: 'Meherpur', upazilas: ['Gangni', 'Meherpur Sadar', 'Mujibnagar'] },
  { division: 'Khulna', district: 'Narail', upazilas: ['Kalia', 'Lohagara', 'Narail Sadar'] },
  { division: 'Khulna', district: 'Satkhira', upazilas: ['Assasuni', 'Debhata', 'Kalaroa', 'Kaliganj', 'Satkhira Sadar', 'Shyamnagar', 'Tala'] },

  // ── Sylhet Division ──
  { division: 'Sylhet', district: 'Habiganj', upazilas: ['Ajmiriganj', 'Bahubal', 'Baniyachong', 'Chunarughat', 'Habiganj Sadar', 'Lakhai', 'Madhabpur', 'Nabiganj', 'Shayestaganj'] },
  { division: 'Sylhet', district: 'Moulvibazar', upazilas: ['Barlekha', 'Juri', 'Kamalganj', 'Kulaura', 'Moulvibazar Sadar', 'Rajnagar', 'Sreemangal'] },
  { division: 'Sylhet', district: 'Sunamganj', upazilas: ['Bishwamvarpur', 'Chhatak', 'Shantiganj', 'Derai', 'Dharamapasha', 'Dowarabazar', 'Jagannathpur', 'Jamalganj', 'Sullah', 'Sunamganj Sadar', 'Tahirpur', 'Madhyanagar'] },
  { division: 'Sylhet', district: 'Sylhet', upazilas: ['Balaganj', 'Beanibazar', 'Bishwanath', 'Companiganj', 'Dakshin Surma', 'Fenchuganj', 'Golapganj', 'Gowainghat', 'Jaintiapur', 'Kanaighat', 'Osmani Nagar', 'Sylhet Sadar', 'Zakiganj'] }
];

/** All upazila names flattened, for quick lookup/search without the district grouping. */
export const ALL_UPAZILA_NAMES: string[] = BD_UPAZILAS.flatMap((d) => d.upazilas);
