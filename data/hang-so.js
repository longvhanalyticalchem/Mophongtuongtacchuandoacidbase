// HẰNG SỐ: thư viện chất (pKa, điện tích, dạng đưa vào) và thư viện chỉ thị (pKa, khoảng đổi màu, pT, màu).
// Sửa giá trị ở đây thì mô phỏng, đồ thị, bảng, đáp án và phép tính trong lời giải cập nhật theo. Xem README, mục "Sửa hằng số".

const library={
  HCl:{n:1,pKa:[-6],zFull:0,h:1,counter:'inert'},
  HNO3:{n:1,pKa:[-1.4],zFull:0,h:1,counter:'inert'},
  H2SO4:{n:2,pKa:[-3,1.99],zFull:0,h:2,counter:'inert'},
  CH3COOH:{n:1,pKa:[4.73],zFull:0,h:1,counter:'inert'},
  'CH2Cl-COOH':{n:1,pKa:[2.9],zFull:0,h:1,counter:'inert'},
  H3PO4:{n:3,pKa:[2.15,7.20,12.4],zFull:0,h:3,counter:'inert'},
  H2C2O4:{n:2,pKa:[1.25,4.27],zFull:0,h:2,counter:'inert'},
  'Acid citric':{n:3,pKa:[3.13,4.76,6.40],zFull:0,h:3,counter:'inert'},
  H3BO3:{n:1,pKa:[9.24],zFull:0,h:1,counter:'inert'},
  NaOH:{n:0,pKa:[],zFull:1,h:0,counter:'water'},
  KOH:{n:0,pKa:[],zFull:1,h:0,counter:'water'},
  'Ba(OH)2':{n:0,pKa:[],zFull:2,h:0,counter:'water'},
  NH3:{n:1,pKa:[9.25],zFull:1,h:0,counter:'inert'},
  NH4Cl:{n:1,pKa:[9.25],zFull:1,h:1,counter:'inert'},
  Na2CO3:{n:2,pKa:[6.35,10.33],zFull:0,h:0,counter:'inert'},
  NaHCO3:{n:2,pKa:[6.35,10.33],zFull:0,h:1,counter:'inert'}
};

// Khoảng pH chuyển màu, màu hai dạng, nồng độ và dung môi của dung dịch chỉ thị.
// pK_HInd: bảng tra cứu (Engineering ToolBox, Wired Chemist). pT: da cam methyl 4,0; đỏ methyl 5,5; quỳ 7,0; phenolphtalein 9,0
// theo bảng chỉ số chuẩn độ pT; các chỉ thị còn lại lấy pT ≈ pK_HInd (cách gần đúng).
const indicatorLibrary={
  'Tropeolin 00':{pKa:[2.0],ranges:[[1.4,3.2]],pT:2.0,colors:['#D7263D','#F2D21A'],sol:'0,1 % và 0,01 % trong nước'},
  'Xanh thymol':{pKa:[1.65,8.9],ranges:[[1.2,2.8],[8,9.6]],pT:8.9,rangePT:[1.65,8.9],colors:['#D7263D','#F2D21A','#4A86E8'],sol:''},
  'Xanh bromophenol':{pKa:[4.0],ranges:[[3.0,4.6]],pT:4.0,colors:['#F2D21A','#5B4FC9'],sol:'0,1 % trong nước'},
  'Da cam methyl':{pKa:[3.46],ranges:[[3.1,4.4]],pT:4.0,colors:['#E5486E','#F2C21A'],sol:'0,1 % trong nước'},
  'Lục bromocresol':{pKa:[4.7],ranges:[[4.0,5.4]],pT:4.7,colors:['#F2D21A','#4A86E8'],sol:'0,02 % trong cồn 20 %'},
  'Đỏ methyl':{pKa:[5.0],ranges:[[4.2,6.2]],pT:5.5,colors:['#D7263D','#F2D21A'],sol:'0,1 % và 0,2 % trong cồn 60 %'},
  'Quỳ':{pKa:[6.5],ranges:[[5.0,8.0]],pT:7.0,colors:['#D7263D','#4A6FD0'],sol:'1,0 % trong nước'},
  'Xanh bromothymol':{pKa:[7.1],ranges:[[6.0,7.6]],pT:7.1,colors:['#F2D21A','#4A86E8'],sol:'0,05 % trong cồn 20 %'},
  'Đỏ phenol':{pKa:[7.9],ranges:[[6.4,8.0]],pT:7.9,colors:['#F2D21A','#D7263D'],sol:'0,1 % trong cồn 20 %'},
  'Đỏ trung tính':{pKa:[7.4],ranges:[[6.8,8.0]],pT:7.4,colors:['#D7263D','#E3A33A'],sol:'0,1 % trong cồn 60 %'},
  'Phenolphtalein':{pKa:[9.4],ranges:[[8.0,10.0]],pT:9.0,colors:['#FFFFFF','#D94FB5'],sol:'0,1 % và 1 % trong cồn 90 %'},
  'Thymolphtalein':{pKa:[9.9],ranges:[[9.3,10.5]],pT:9.9,colors:['#FFFFFF','#4A78E0'],sol:'0,1 % trong cồn 90 %'},
  'Vàng alizarin':{pKa:[11.2],ranges:[[10.1,12.0]],pT:11.2,colors:['#F2D21A','#7B3FA0'],sol:'0,1 % trong nước'},
  'Đỏ bromophenol':{pKa:[6.0],ranges:[[5.2,6.8]],pT:6.0,colors:['#F2D21A','#D7263D'],sol:''},
  'Tashiro (đỏ methyl + xanh methylen)':{pKa:[5.4],ranges:[[4.2,6.2]],pT:5.4,colors:['#7E57C2','#6FAE4F'],sol:'3 giọt đỏ methyl + 1 giọt xanh methylen; lục (pH 6,2) → tím (pH 4,2); pT 5,4'}
};
