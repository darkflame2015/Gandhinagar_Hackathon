import { useEffect, useState } from 'react';
import { Box, Paper, Typography, Grid, Card, CardContent, Chip } from '@mui/material';
import { ecosystemAPI } from '../../services/api';

export default function EcosystemPartners() {
  const [schemes, setSchemes] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [fpos, setFpos] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [schemesRes, suppliersRes, warehousesRes, fposRes] = await Promise.all([
        ecosystemAPI.getSchemes(),
        ecosystemAPI.getSuppliers(),
        ecosystemAPI.getWarehouses(),
        ecosystemAPI.getFPOs(),
      ]);
      
      setSchemes(schemesRes.data.data);
      setSuppliers(suppliersRes.data.data);
      setWarehouses(warehousesRes.data.data);
      setFpos(fposRes.data.data);
    } catch (error) {
      console.error('Error fetching ecosystem data:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Ecosystem Partners
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Government Schemes
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {schemes.map((scheme: any) => (
          <Grid item xs={12} md={6} key={scheme.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{scheme.name}</Typography>
                <Chip label={scheme.type} size="small" sx={{ mb: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  {scheme.benefits}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" gutterBottom>
        Input Suppliers
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {suppliers.map((supplier: any) => (
          <Grid item xs={12} md={6} key={supplier.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{supplier.name}</Typography>
                <Typography variant="body2">{supplier.type}</Typography>
                <Typography variant="caption">Rating: {supplier.rating} ⭐</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" gutterBottom>
        Warehouses
      </Typography>
      <Grid container spacing={2}>
        {warehouses.map((warehouse: any) => (
          <Grid item xs={12} md={6} key={warehouse.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{warehouse.name}</Typography>
                <Typography variant="body2">{warehouse.location}</Typography>
                <Typography variant="caption">Capacity: {warehouse.capacity}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
